const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); // Dùng để đọc file hình ảnh
const { faker } = require('@faker-js/faker'); // Thư viện tạo dữ liệu giả

// Sử dụng dynamic import để load p-limit
let pLimit;
(async () => {
  pLimit = (await import('p-limit')).default;

  // Hàm tạm dừng thực thi trong một khoảng thời gian (ms)
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Hàm tạo ra một bản ghi dữ liệu giả cho một listing
  async function generateFakeData() {
    return {
      creator: faker.database.mongodbObjectId(),
      category: faker.helpers.arrayElement(['Apartment', 'House', 'Studio']),
      type: faker.helpers.arrayElement(['Rental', 'Sale']),
      streetAddress: faker.location.streetAddress(),
      aptSuite: faker.helpers.arrayElement(['Apt 101', 'Suite 202', 'Unit 303']),
      city: faker.location.city(),
      province: faker.location.state(),
      country: faker.location.country(),
      guestCount: faker.number.int({ min: 1, max: 10 }),
      bedroomCount: faker.number.int({ min: 1, max: 5 }),
      bedCount: faker.number.int({ min: 1, max: 6 }),
      bathroomCount: faker.number.int({ min: 1, max: 4 }),
      amenities: JSON.stringify(faker.helpers.arrayElements(['WiFi', 'Pool', 'Gym'], 3)),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      highlight: faker.lorem.words(2),
      highlightDesc: faker.lorem.sentence(),
      price: faker.number.int({ min: 50, max: 1000 }),
    };
  }

  /**
   * Hàm tạo dữ liệu giả cho listings.
   * @param {number} batchSize - Số bản ghi gửi lên mỗi lần (một batch).
   * @param {number} totalRecords - Tổng số bản ghi cần tạo.
   * @param {number} delay - Thời gian chờ (ms) giữa mỗi batch.
   */
  async function fakeCreateListings(batchSize, totalRecords, delay) {
    // Giới hạn số lượng request thực thi đồng thời là 5
    const limit = pLimit(5);

    let successCount = 0;
    let errorCount = 0;

    // Vòng lặp để gửi từng batch dữ liệu
    for (let i = 0; i < totalRecords; i += batchSize) {
      const requests = [];

      // Tạo ra batchSize yêu cầu (hoặc ít hơn nếu sắp hết số lượng cần tạo)
      for (let j = 0; j < batchSize && i + j < totalRecords; j++) {
        const formData = new FormData();
        const fakeData = await generateFakeData();

        // Thêm tất cả dữ liệu giả vào form
        Object.entries(fakeData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // Thêm file hình ảnh nếu tồn tại
        ['./public/uploads/1.jpg', './public/uploads/2.jpg'].forEach((imagePath) => {
          if (fs.existsSync(imagePath)) {
            formData.append('listingPhotos', fs.readFileSync(imagePath), 'image.jpg');
          }
        });

        // Thêm yêu cầu POST vào danh sách, sử dụng limit để giới hạn song song
        requests.push(limit(() =>
          axios.post('http://localhost:3001/properties/create', formData, {
            headers: { ...formData.getHeaders() },
          })
        ));
      }

      try {
        // Thực thi tất cả request trong batch hiện tại
        const responses = await Promise.all(requests);
        successCount += responses.length;
        console.log(`Hoàn thành batch: Đã tạo ${responses.length} bản ghi.`);
      } catch (error) {
        // Nếu có lỗi, toàn bộ batch được coi là lỗi
        errorCount += batchSize;
        console.error('Lỗi trong batch:', error.response?.data || error.message);
      }

      // Chờ một khoảng thời gian trước khi gửi batch tiếp theo
      console.log(`Chờ ${delay}ms trước khi chạy batch tiếp theo...`);
      await sleep(delay);
    }

    // In ra kết quả cuối cùng sau khi hoàn thành toàn bộ quá trình
    console.log(`Quá trình hoàn thành: ${successCount} thành công, ${errorCount} thất bại.`);
  }

  // Gọi hàm tạo dữ liệu giả
  // Tham số: batchSize = 20, totalRecords = 5000, delay = 2000ms
  // Phước cần chỉnh thì ở dưới này 
  fakeCreateListings(20, 5000, 2000); // (20 data/1  lần, tổng cộng 5k dữ liệu/1 lần, 2000ms/times)
})();

// Chạy lệnh: node fake.js
// TODO: cần tạo 14k dữ liệu 
// DONE: Đã thử tạo thành công 6k dữ liệu 
