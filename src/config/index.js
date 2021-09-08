module.exports = {
  database: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
  },
  PORT: process.env.PORT || 4000,
  SECRET_TOKEN: process.env.SECRET,
};
