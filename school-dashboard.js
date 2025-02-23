import { db } from './firebase-config.js';
import { ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// تسجيل طالب جديد
document.getElementById('registerStudentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentName = document.getElementById('studentName').value.trim();
  const studentGrade = document.getElementById('studentGrade').value.trim();
  const studentNationalId = document.getElementById('studentNationalId').value.trim();

  if (!studentName || !studentGrade || !studentNationalId) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const studentRef = ref(db, `students/${studentNationalId}`);
    await set(studentRef, {
      name: studentName,
      grade: studentGrade,
      nationalId: studentNationalId,
    });

    alert('تم تسجيل الطالب بنجاح!');
    document.getElementById('registerStudentForm').reset();
    loadStudents(); // إعادة تحميل قائمة الطلاب
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الطالب:', error);
    alert('حدث خطأ أثناء تسجيل الطالب: ' + error.message);
  }
});

// إدارة الحافلات
document.getElementById('manageBusesForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const busNumber = document.getElementById('busNumber').value.trim();
  const busCapacity = document.getElementById('busCapacity').value;

  if (!busNumber || !busCapacity) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const busRef = ref(db, `buses/${busNumber}`);
    await set(busRef, {
      number: busNumber,
      capacity: busCapacity,
    });

    alert('تمت إضافة/تحديث الحافلة بنجاح!');
    document.getElementById('manageBusesForm').reset();
    loadBuses(); // إعادة تحميل قائمة الحافلات
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة/تحديث الحافلة:', error);
    alert('حدث خطأ أثناء إضافة/تحديث الحافلة: ' + error.message);
  }
});

// إدارة السائقين
document.getElementById('manageDriversForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const driverName = document.getElementById('driverName').value.trim();
  const driverNationalId = document.getElementById('driverNationalId').value.trim();

  if (!driverName || !driverNationalId) {
    alert('يرجى ملء جميع الحقول.');
    return;
  }

  try {
    const driverRef = ref(db, `drivers/${driverNationalId}`);
    await set(driverRef, {
      name: driverName,
      nationalId: driverNationalId,
    });

    alert('تمت إضافة/تحديث السائق بنجاح!');
    loadDrivers(); // إعادة تحميل قائمة السائقين
    document.getElementById('manageDriversForm').reset();
  } catch (error) {
    console.error('حدث خطأ أثناء إضافة/تحديث السائق:', error);
    alert('حدث خطأ أثناء إضافة/تحديث السائق: ' + error.message);
  }
});

// تحميل قائمة الطلاب
function loadStudents() {
  const studentsRef = ref(db, 'students');
  onValue(studentsRef, (snapshot) => {
    const students = snapshot.val();
    const studentsList = document.getElementById('students');
    studentsList.innerHTML = ''; // مسح القائمة الحالية

    if (students) {
      Object.keys(students).forEach((studentNationalId) => {
        const student = students[studentNationalId];
        const li = document.createElement('li');
        li.textContent = `${student.name} - ${student.grade} - ${student.nationalId}`;

        // زر حذف الطالب
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'حذف';
        deleteButton.onclick = () => deleteStudent(studentNationalId);
        li.appendChild(deleteButton);

        studentsList.appendChild(li);
      });
    } else {
      studentsList.innerHTML = '<li>لا يوجد طلاب مسجلين.</li>';
    }
  });
}

// حذف طالب
async function deleteStudent(studentNationalId) {
  if (confirm(`هل تريد حذف الطالب ذو الرقم الوطني "${studentNationalId}"؟`)) {
    try {
      const studentRef = ref(db, `students/${studentNationalId}`);
      await remove(studentRef);
      alert('تم حذف الطالب بنجاح!');
      loadStudents(); // إعادة تحميل قائمة الطلاب
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الطالب:', error);
      alert('حدث خطأ أثناء حذف الطالب: ' + error.message);
    }
  }
}

// تحميل قائمة الحافلات
function loadBuses() {
  const busesRef = ref(db, 'buses');
  onValue(busesRef, (snapshot) => {
    const buses = snapshot.val();
    const busesList = document.getElementById('buses');
    busesList.innerHTML = ''; // مسح القائمة الحالية

    if (buses) {
      Object.keys(buses).forEach((busNumber) => {
        const bus = buses[busNumber];
        const li = document.createElement('li');
        li.textContent = `رقم الحافلة: ${bus.number} - السعة: ${bus.capacity}`;

        // زر حذف الحافلة
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'حذف';
        deleteButton.onclick = () => deleteBus(busNumber);
        li.appendChild(deleteButton);

        busesList.appendChild(li);
      });
    } else {
      busesList.innerHTML = '<li>لا يوجد حافلات مسجلة.</li>';
    }
  });
}

// حذف حافلة
async function deleteBus(busNumber) {
  if (confirm(`هل تريد حذف الحافلة ذات الرقم "${busNumber}"؟`)) {
    try {
      const busRef = ref(db, `buses/${busNumber}`);
      await remove(busRef);
      alert('تم حذف الحافلة بنجاح!');
      loadBuses(); // إعادة تحميل قائمة الحافلات
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الحافلة:', error);
      alert('حدث خطأ أثناء حذف الحافلة: ' + error.message);
    }
  }
}

// تحميل قائمة السائقين
function loadDrivers() {
  const driversRef = ref(db, 'drivers');
  onValue(driversRef, (snapshot) => {
    const drivers = snapshot.val();
    const driversList = document.getElementById('drivers');
    driversList.innerHTML = ''; // مسح القائمة الحالية

    if (drivers) {
      Object.keys(drivers).forEach((driverNationalId) => {
        const driver = drivers[driverNationalId];
        const li = document.createElement('li');
        li.textContent = `${driver.name} - ${driver.nationalId}`;

        // زر حذف السائق
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'حذف';
        deleteButton.onclick = () => deleteDriver(driverNationalId);
        li.appendChild(deleteButton);

        driversList.appendChild(li);
      });
    } else {
      driversList.innerHTML = '<li>لا يوجد سائقين مسجلين.</li>';
    }
  });
}

// حذف سائق
async function deleteDriver(driverNationalId) {
  if (confirm(`هل تريد حذف السائق ذو الرقم الوطني "${driverNationalId}"؟`)) {
    try {
      const driverRef = ref(db, `drivers/${driverNationalId}`);
      await remove(driverRef);
      alert('تم حذف السائق بنجاح!');
      loadDrivers(); // إعادة تحميل قائمة السائقين
    } catch (error) {
      console.error('حدث خطأ أثناء حذف السائق:', error);
      alert('حدث خطأ أثناء حذف السائق: ' + error.message);
    }
  }
}

// تحميل قائمة الطلاب، الحافلات، والسائقين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  loadBuses();
  loadDrivers();
});