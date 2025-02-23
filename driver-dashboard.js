import { db } from './firebase-config.js';
import { ref, onValue, set, get, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

let map;
let marker;
let polyline;
let pathCoordinates = [];

// تهيئة الخريطة
function initMap() {
  map = L.map('map').setView([31.9539, 35.9106], 15); // الموقع الافتراضي

  // إضافة طبقة OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  marker = L.marker([31.9539, 35.9106]).addTo(map); // الموقع الافتراضي
  polyline = L.polyline(pathCoordinates, { color: 'blue' }).addTo(map); // مسار الحافلة
}

// تحديث موقع الحافلة باستخدام GPS
document.getElementById('updateLocation').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        // تحديث موقع الحافلة الحالي
        const busRef = ref(db, 'drivers/BUS001/location');
        set(busRef, newLocation).then(() => {
          alert('تم تحديث موقع الحافلة بنجاح!');
          updateMarker(newLocation);
        });

        // حفظ النقطة الجديدة في قائمة المسار
        const pathRef = ref(db, 'drivers/BUS001/path');
        push(pathRef, newLocation);
        pathCoordinates.push([newLocation.lat, newLocation.lng]);
        polyline.setLatLngs(pathCoordinates);
      },
      (error) => {
        console.error('Error getting location:', error.message);
        alert('حدث خطأ أثناء الحصول على الموقع.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert('GPS غير مدعوم في هذا الجهاز.');
  }
});

// تحديث علامة الموقع على الخريطة
function updateMarker(location) {
  marker.setLatLng([location.lat, location.lng]);
  map.setView([location.lat, location.lng], 15); // تحديث التكبير للخريطة
}

// تحميل قائمة الأطفال
function loadChildren() {
  const childrenRef = ref(db, 'drivers/BUS001/children');
  onValue(childrenRef, (snapshot) => {
    const childrenList = document.getElementById('children');
    childrenList.innerHTML = ''; // مسح القائمة الحالية

    const children = snapshot.val();
    if (children) {
      let presentCount = 0;
      let absentCount = 0;

      Object.keys(children).forEach((nationalId) => {
        const child = children[nationalId];
        const li = document.createElement('li');

        li.innerHTML = `
          <span>${child.name} (${child.nationalId})</span>
          <button data-national-id="${nationalId}" class="toggle-attendance">
            ${child.attendance ? 'حاضر' : 'غائب'}
          </button>
        `;

        childrenList.appendChild(li);

        // تحديث الإحصائيات
        if (child.attendance) {
          presentCount++;
        } else {
          absentCount++;
        }
      });

      // تحديث تقرير الحضور والغياب
      document.getElementById('presentCount').textContent = presentCount;
      document.getElementById('absentCount').textContent = absentCount;

      // إضافة مستمع للأزرار
      document.querySelectorAll('.toggle-attendance').forEach((button) => {
        button.addEventListener('click', toggleAttendance);
      });
    } else {
      childrenList.innerHTML = '<li>لا يوجد أطفال مسجلين.</li>';
    }
  });
}

// تغيير حالة الحضور والغياب
async function toggleAttendance(event) {
  const nationalId = event.target.dataset.nationalId;

  try {
    const childRef = ref(db, `drivers/BUS001/children/${nationalId}`);
    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      const childData = snapshot.val();
      const newStatus = !childData.attendance;

      await set(childRef, {
        ...childData,
        attendance: newStatus,
      });

      alert(`تم تسجيل الطفل كـ ${newStatus ? 'حاضر' : 'غائب'}.`);
      loadChildren(); // إعادة تحميل القائمة بعد التحديث
    } else {
      alert('لم يتم العثور على بيانات الطفل.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تحديث حالة الحضور:', error);
    alert('حدث خطأ أثناء تحديث حالة الحضور.');
  }
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nationalId = document.getElementById('nationalId').value.trim();

  try {
    const driverRef = ref(db, `drivers/${nationalId}`);
    const snapshot = await get(driverRef);

    if (snapshot.exists()) {
      alert('تم تسجيل الدخول بنجاح!');
      // إخفاء نموذج تسجيل الدخول وعرض باقي المحتوى
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('updateLocation').style.display = 'block';
      document.getElementById('map').style.display = 'block';
      document.getElementById('childrenList').style.display = 'block';
      document.getElementById('attendanceReport').style.display = 'block';

      // تحميل البيانات بعد تسجيل الدخول
      initMap();
      loadChildren();
    } else {
      alert('الرقم الوطني غير صحيح.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء تسجيل الدخول:', error.message);
    alert('حدث خطأ أثناء تسجيل الدخول: ' + error.message);
  }
});