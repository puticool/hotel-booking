module.exports = {
    env: {
      node: true, // Môi trường Node.js
      es2021: true, // Hỗ trợ ES2021
    },
    extends: [
      'eslint:recommended', // Sử dụng các quy tắc cơ bản của ESLint
      'airbnb-base', // Sử dụng quy tắc từ Airbnb
      'plugin:prettier/recommended', // Kết hợp Prettier
    ],
    parserOptions: {
      ecmaVersion: 12, // Sử dụng ES2021
      sourceType: 'module', // Hỗ trợ ES Modules (nếu bạn sử dụng import/export)
    },
    plugins: [
      'import', // Kiểm tra các module import
      'node', // Kiểm tra các quy tắc liên quan đến Node.js
      'promise', // Quy tắc cho các Promise
      'prettier', // Tích hợp Prettier
    ],
    rules: {
      // Quy tắc ESLint cơ bản
      'no-console': 'warn', // Cảnh báo khi sử dụng console.log
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Bỏ qua biến bắt đầu bằng _
      'prefer-const': 'error', // Yêu cầu sử dụng const nếu không tái gán biến
      eqeqeq: ['error', 'always'], // Yêu cầu sử dụng === thay vì ==
      'arrow-parens': ['error', 'always'], // Yêu cầu dấu ngoặc trong arrow function
      // Quy tắc Prettier
      'prettier/prettier': [
        'error',
        {
          singleQuote: true, // Sử dụng dấu nháy đơn
          semi: true, // Yêu cầu có dấu chấm phẩy
          trailingComma: 'es5', // Dấu phẩy ở cuối object/array
          tabWidth: 2, // Tab = 2 spaces
          endOfLine: 'auto', // Phát hiện kiểu xuống dòng tự động
        },
      ],
    },
  };