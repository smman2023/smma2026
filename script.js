//=========================================
// Google Sheets API
//=========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxER_YDEHcxYH8kHCzKS-Tap3EXFzPx3a_Qx33JfHvxsGP1mVfqYr_VDq3RJreB8gWc/exec";

//=========================================
// البيانات
//=========================================

let students = [];
let attendance = [];
let currentStudent = null;

//=========================================
// عناصر الصفحة
//=========================================

const phoneInput = document.getElementById("phoneInput");

const searchBtn = document.getElementById("searchBtn");

const result = document.getElementById("result");

const attendanceResult = document.getElementById("attendanceResult");

const notFound = document.getElementById("notFound");

const container = document.querySelector(".container");

const showAttendanceBtn = document.getElementById("showAttendanceBtn");

const backToStudentBtn = document.getElementById("backToStudentBtn");

//=========================================
// إخفاء زر الحضور عند بداية التشغيل
//=========================================

showAttendanceBtn.style.display = "none";

//=========================================
// Events
//=========================================

searchBtn.addEventListener("click", searchStudent);

showAttendanceBtn.addEventListener("click", showAttendance);

backToStudentBtn.addEventListener("click", function () {

    attendanceResult.classList.add("hidden");

    result.classList.remove("hidden");

});

phoneInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        searchStudent();

    }

});
//=========================================
// تحميل البيانات
//=========================================

async function loadStudents(){

    try{

        searchBtn.disabled = true;

        searchBtn.innerHTML = "جارى تحميل البيانات...";

        const response = await fetch(API_URL);

        const data = await response.json();

        students = data.students || [];

        attendance = data.attendance || [];

        searchBtn.disabled = false;

        searchBtn.innerHTML = `
            <i class="fa-solid fa-magnifying-glass"></i>
            استعلام
        `;

        console.log("Students :", students.length);

        console.log("Attendance :", attendance.length);

    }

    catch(error){

        console.error(error);

        alert("تعذر تحميل البيانات من Google Sheets");

    }

}

loadStudents();


//=========================================
// تنظيف رقم الهاتف
//=========================================

function cleanPhone(phone){

    return String(phone)

        .replace(/[^\d]/g,"")

        .replace(/^0+/,"");

}


//=========================================
// عرض بيانات الطالب
//=========================================

function displayStudent(student){

    currentStudent = student;

    attendanceResult.classList.add("hidden");

    result.classList.remove("hidden");

    notFound.classList.add("hidden");

    showAttendanceBtn.style.display = "inline-flex";

    document.getElementById("studentCode").textContent = student.code;
document.getElementById("studentName").textContent = student.name;
document.getElementById("studentGrade").textContent = student.grade;
document.getElementById("studentGroup").textContent = student.group;
document.getElementById("studentStart").textContent = student.start;
document.getElementById("studentTime").textContent = student.time;
document.getElementById("studentWhatsapp").textContent = student.studentWhatsapp;
document.getElementById("parentWhatsapp").textContent = student.parentWhatsapp;

    showOtherStudents(student);

}
//=========================================
// عرض الطلاب المرتبطين بنفس الرقم
//=========================================

function showOtherStudents(student){

    const old=document.getElementById("otherStudents");

    if(old){

        old.remove();

    }

    const sameStudents=students.filter(item=>

        cleanPhone(item.parentWhatsapp)===cleanPhone(student.parentWhatsapp)

        && item.code!==student.code

    );

    if(sameStudents.length===0){

        return;

    }

    const card=document.createElement("div");

    card.className="result-card";

    card.id="otherStudents";

    card.innerHTML=`

        <h2 class="result-title">

            <i class="fa-solid fa-users"></i>

            طلاب آخرون لنفس ولي الأمر

        </h2>

    `;

    sameStudents.forEach(item=>{

        const btn=document.createElement("button");

        btn.className="search-btn";

        btn.style.marginTop="10px";

        btn.style.width="100%";

        btn.innerHTML=`${item.name}`;

        btn.onclick=()=>displayStudent(item);

        card.appendChild(btn);

    });

    result.after(card);

}



//=========================================
// عرض قائمة الطلاب عند تطابق الرقم
//=========================================

function showStudentList(list){

    const old=document.getElementById("studentList");

    if(old){

        old.remove();

    }

    const card=document.createElement("div");

    card.className="result-card";

    card.id="studentList";

    card.innerHTML=`

        <h2 class="result-title">

            <i class="fa-solid fa-list"></i>

            اختر الطالب

        </h2>

    `;

    list.forEach(student=>{

        const btn=document.createElement("button");

        btn.className="search-btn";

        btn.style.marginTop="10px";

        btn.style.width="100%";

        btn.innerHTML=student.name;

        btn.onclick=function(){

            card.remove();

            displayStudent(student);

        };

        card.appendChild(btn);

    });

    result.after(card);

}
//=========================================
// البحث عن الطالب
//=========================================

function searchStudent(){

    const phone = cleanPhone(phoneInput.value);

    if(phone===""){

        alert("برجاء إدخال رقم الواتساب");

        phoneInput.focus();

        return;

    }

    // إخفاء جميع النتائج السابقة

    result.classList.add("hidden");

    attendanceResult.classList.add("hidden");

    notFound.classList.add("hidden");

    showAttendanceBtn.style.display="none";

    const old1=document.getElementById("studentList");
    if(old1) old1.remove();

    const old2=document.getElementById("otherStudents");
    if(old2) old2.remove();

    // البحث

    const foundStudents=students.filter(student=>{

        return cleanPhone(student.studentWhatsapp)===phone ||

               cleanPhone(student.parentWhatsapp)===phone;

    });

    if(foundStudents.length===0){

        notFound.classList.remove("hidden");

        return;

    }

    if(foundStudents.length===1){

        displayStudent(foundStudents[0]);

        return;

    }

    showStudentList(foundStudents);

}
//=========================================
// عرض سجل الحضور
//=========================================

function showAttendance(){

    if(!currentStudent){

        return;

    }

    const phone=cleanPhone(currentStudent.studentWhatsapp);

    const record=attendance.find(item=>

        cleanPhone(item.WhatsApp)===phone

    );

    if(!record){

        alert("لا توجد بيانات حضور لهذا الطالب");

        return;

    }

    result.classList.add("hidden");

    attendanceResult.classList.remove("hidden");

    document.getElementById("attendanceName").textContent=record.StudentName;

    document.getElementById("attendanceCount").textContent=record.Attendance;

    document.getElementById("absenceCount").textContent=record.Absence;

    document.getElementById("lastAttendance").textContent=record.LastAttendance;

    document.getElementById("attendanceRate").textContent=record.Rate;

}
//=========================================
// الرجوع لبيانات الطالب
//=========================================

backToStudentBtn.addEventListener("click",function(){

    attendanceResult.classList.add("hidden");

    result.classList.remove("hidden");

});


//=========================================
// الضغط على Enter
//=========================================

phoneInput.addEventListener("keydown",function(e){

    if(e.key==="Enter"){

        searchStudent();

    }

});


//=========================================
// منع المسافات فى أول الإدخال
//=========================================

phoneInput.addEventListener("input",function(){

    this.value=this.value.trimStart();

});


//=========================================
// تنظيف الشاشة عند تغيير رقم الهاتف
//=========================================

phoneInput.addEventListener("input",function(){

    result.classList.add("hidden");

    attendanceResult.classList.add("hidden");

    notFound.classList.add("hidden");

    showAttendanceBtn.style.display="none";

    currentStudent=null;

    const studentList=document.getElementById("studentList");

    if(studentList){

        studentList.remove();

    }

    const otherStudents=document.getElementById("otherStudents");

    if(otherStudents){

        otherStudents.remove();

    }

});