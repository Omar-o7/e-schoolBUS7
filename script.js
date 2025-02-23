import { db, auth, provider } from './firebase-config.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// تسجيل دخول السائق
document.getElementById('driverLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nationalId = document.getElementById('driverNationalIdLogin').value.trim();

  try {
    const driverRef = ref(db, `drivers/${nationalId}`);
    const snapshot = await get(driverRef);
    if (snapshot.exists()) {
      alert('تم تسجيل الدخول بنجاح!');
      window.location.href = 'driver-dashboard.html';
    } else {
      alert('الرقم الوطني غير صحيح.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الدخول:', error);
    alert('حدث خطأ أثناء تسجيل الدخول.');
  }
});

// تسجيل دخول ولي الأمر بدون تحقق
document.getElementById('parentLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('parentNameLogin').value.trim();
  const phone = document.getElementById('parentPhoneLogin').value.trim();

  if (name && phone) {
    alert('تم تسجيل الدخول بنجاح!');
    window.location.href = `parent-dashboard.html?phone=${phone}`;
  } else {
    alert('يرجى إدخال جميع البيانات.');
  }
});

// تسجيل دخول المدرسة
document.getElementById('schoolLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const schoolName = document.getElementById('schoolNameLogin').value.trim();
  const password = document.getElementById('schoolPasswordLogin').value.trim();

  try {
    const schoolRef = ref(db, `schools/${schoolName}`);
    const snapshot = await get(schoolRef);
    if (snapshot.exists() && snapshot.val().password === password) {
      alert('تم تسجيل الدخول بنجاح!');
      window.location.href = 'school-dashboard.html';
    } else {
      alert('اسم المدرسة أو كلمة المرور غير صحيح.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الدخول:', error);
    alert('حدث خطأ أثناء تسجيل الدخول.');
  }
});

// تسجيل الدخول باستخدام Google
document.getElementById('googleLogin').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    alert('تم تسجيل الدخول بنجاح باستخدام Google!');
    // يمكنك توجيه المستخدم إلى لوحة التحكم المناسبة بناءً على بياناته
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الدخول باستخدام Google:', error);
    alert('حدث خطأ أثناء تسجيل الدخول باستخدام Google.');
  }
});

// الوصول إلى إدارة المدارس
document.getElementById('adminAccessForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const adminPassword = document.getElementById('adminPassword').value.trim();

  // استبدل هذه القيمة بكلمة مرور المسؤول الفعلية
  const actualAdminPassword = 'admin123';

  if (adminPassword === actualAdminPassword) {
    alert('تم الوصول بنجاح إلى إدارة المدارس!');
    window.location.href = 'manage-schools.html';
  } else {
    alert('كلمة المرور غير صحيحة.');
  }
});