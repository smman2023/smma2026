//=========================================
// Google Sheets
//=========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxfO2j_rjDcv0lpsPiAoXeEDHogiF2OgrWUVFTNPrAQ22_zK1MMgRsFeWGea75SvvCR/exec";
const ATTENDANCE_API = "https://script.google.com/macros/s/AKfycbxVoTCp_U39WL_p31kqdX7PKC3Kq4GSntIACwvd_GqEN1iX-aDe59lDzMipFxOG2bqV/exec";
let students = [];


//=========================================
// عناصر الصفحة
//=========================================

const phoneInput = document.getElementById("phoneInput");

const searchBtn = document.getElementById("searchBtn");

const result = document.getElementById("result");
const notFound = document.getElementById("notFound");

const container = document.querySelector(".container");
const attendanceBtn = document.getElementById("attendanceBtn");

const attendanceCard = document.getElementById("attendanceCard");

const backBtn = document.getElementById("backBtn");

let currentStudent = null;
//=========================================
// تحميل البيانات
//=========================================

async function loadStudents(){

    try{

        searchBtn.disabled=true;

        searchBtn.innerHTML="جارى تحميل البيانات...";

        const response=await fetch(API_URL);

        students=await response.json();

        console.log("Students:",students.length);

        searchBtn.disabled=false;

        searchBtn.innerHTML="استعلام";

    }

    catch(error){

        console.log(error);

        alert("تعذر تحميل البيانات");

    }

}

loadStudents();
//=========================================
// Events
//=========================================

searchBtn.addEventListener("click",searchStudent);

phoneInput.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        searchStudent();

    }

});
attendanceBtn.addEventListener("click",showAttendance);

backBtn.addEventListener("click",function(){

    attendanceCard.classList.add("hidden");

    result.classList.remove("hidden");

});
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
    result.classList.remove("hidden");
attendanceCard.classList.add("hidden");

    attendanceBtn.classList.remove("hidden");
    notFound.classList.add("hidden");

    let list=document.getElementById("studentList");

    if(list){

        list.remove();

    }
currentStudent = student;

attendanceBtn.classList.remove("hidden");

    document.getElementById("studentCode").textContent=student.code;
    document.getElementById("studentName").textContent=student.name;
    document.getElementById("studentGrade").textContent=student.grade;
    document.getElementById("studentGroup").textContent=student.group;
    document.getElementById("studentStart").textContent=student.start;
    document.getElementById("studentTime").textContent=student.time;
    document.getElementById("studentWhatsapp").textContent=student.studentWhatsapp;
    document.getElementById("parentWhatsapp").textContent=student.parentWhatsapp;
//=========================================
// عرض الطلاب الآخرين بنفس رقم الواتساب
//=========================================

showOtherStudents(student);

}
//=========================================
// فتح بيانات الطالب
//=========================================
//=========================================
// عرض الطلاب الآخرين
//=========================================

function showOtherStudents(currentStudent){

    // حذف القائمة القديمة إن وجدت
    let old=document.getElementById("otherStudents");

    if(old){

        old.remove();

    }

    // البحث عن الطلاب المرتبطين بنفس الرقم
    const others=students.filter(student=>

        (

            cleanPhone(student.studentWhatsapp)===cleanPhone(currentStudent.studentWhatsapp)

            ||

            cleanPhone(student.parentWhatsapp)===cleanPhone(currentStudent.parentWhatsapp)

        )

        &&

        String(student.code)!==String(currentStudent.code)

    );

    // إذا لم يوجد طلاب آخرون
    if(others.length===0){

        return;

    }

    let html=`

    <div id="otherStudents" class="student-list">

        <div class="student-header">

            <h2>

                👨‍👩‍👧‍👦 طلاب آخرون

            </h2>

        </div>

    `;

    others.forEach(student=>{

        html+=`

        <div class="student-card-new">

            <div class="student-name">

                ${student.name}

            </div>

            <button

                class="student-open-btn"

                onclick="displayStudentByCode('${student.code}')">

                عرض البيانات

            </button>

        </div>

        `;

    });

    html+=`</div>`;

    result.insertAdjacentHTML("afterend",html);

}
function displayStudentByCode(code){

    const student=students.find(s=>String(s.code)===String(code));

    if(student){

        displayStudent(student);

    }

}
//=========================================
// عرض قائمة الطلاب
//=========================================

function showStudentList(list){

    result.classList.add("hidden");
    notFound.classList.add("hidden");

    let old=document.getElementById("studentList");

    if(old){

        old.remove();

    }

    let html=`

    <div id="studentList" class="student-list">

        <div class="student-header">

            <div class="student-header-icon">

                <i class="fa-solid fa-users"></i>

            </div>

            <h2>

                تم العثور على ${list.length} طالب

            </h2>

            <p>

                اختر الطالب المطلوب

            </p>

        </div>

    `;

    list.forEach(student=>{

        html+=`

        <div class="student-card-new">

            <div class="student-name">

                ${student.name}

            </div>

            <button

                class="student-open-btn"

                onclick="displayStudentByCode('${student.code}')">

                عرض البيانات

            </button>

        </div>

        `;

    });

    html+=`</div>`;

    container.insertAdjacentHTML("beforeend",html);

}
//=========================================
// البحث عن الطالب
//=========================================

function searchStudent(){

    const phone = cleanPhone(phoneInput.value);

    // التحقق من إدخال رقم
    if(phone===""){

        alert("برجاء إدخال رقم الواتساب");

        phoneInput.focus();

        return;

    }

    // حذف القائمة القديمة
    let old=document.getElementById("studentList");

    if(old){

        old.remove();

    }

    // إخفاء النتائج السابقة
    result.classList.add("hidden");
    notFound.classList.add("hidden");

    // البحث عن جميع الطلاب
    const matchedStudents = students.filter(student =>

        cleanPhone(student.studentWhatsapp)===phone ||

        cleanPhone(student.parentWhatsapp)===phone

    );

    // لا يوجد طالب
    if(matchedStudents.length===0){

    notFound.classList.remove("hidden");

    phoneInput.value = "";

    return;

}
    // طالب واحد
    if(matchedStudents.length===1){

    displayStudent(matchedStudents[0]);

    phoneInput.value = "";

    return;

}

    // أكثر من طالب
    showStudentList(matchedStudents);

phoneInput.value = "";

}
function searchStudent(){

    // الكود الموجود عندك

}

// الصق هنا مباشرة

function showAttendance(){

    result.classList.add("hidden");

    attendanceCard.classList.remove("hidden");

    attendanceContent.innerHTML="جارى تحميل سجل الحضور...";

}
attendanceBtn.addEventListener("click", function(){

    result.classList.add("hidden");

    attendanceCard.classList.remove("hidden");

});

backBtn.addEventListener("click", function(){

    attendanceCard.classList.add("hidden");

    result.classList.remove("hidden");

});
async function showAttendance(){

    result.classList.add("hidden");

    attendanceCard.classList.remove("hidden");

    attendanceContent.innerHTML="جارى تحميل سجل الحضور...";

    try{

        const response=await fetch(ATTENDANCE_API+"?code="+currentStudent.code);

        const data=await response.json();

        if(data.length===0){

            attendanceContent.innerHTML="<h3>لا يوجد سجل حضور لهذا الطالب</h3>";

            return;

        }

        let html=`

        <table class="attendance-table">

            <tr>

                <th>الدرس</th>

                <th>التاريخ</th>

                <th>الحالة</th>

            </tr>

        `;

        data.forEach(item=>{

            html+=`

            <tr>

                <td>${item.lesson}</td>

                <td>${item.date}</td>

                <td>${item.status}</td>

            </tr>

            `;

        });

        html+="</table>";

        attendanceContent.innerHTML=html;

    }

    catch(error){

        attendanceContent.innerHTML="<h3>حدث خطأ أثناء تحميل بيانات الحضور</h3>";

    }

}