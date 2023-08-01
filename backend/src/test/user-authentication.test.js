const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const expect = chai.expect;
const redis = require('redis-mock');
const client = redis.createClient();

chai.use(chaiHttp);

describe('User authentication', () => {
  describe('POST /api/register', () => {
    it('should register a new user', (done) => {
      chai.request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'testpassword',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').equal('User registered successfully');
          done();
        });
    });
  });

  describe('POST /api/login', () => {
    it('should log in a user with valid credentials', (done) => {
      chai.request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'testpassword',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not log in a user with invalid credentials', (done) => {
      chai.request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').equal('Invalid username or password');
          done();
        });
    });
  });

  describe('GET /api/profile', () => {
    let token;

    before((done) => {
      chai.request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'testpassword',
        })
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return the user profile for an authenticated user', (done) => {
      chai.request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('username').equal('testuser');
          done();
        });
    });

    it('should not return the user profile for an unauthenticated user', (done) => {
      chai.request(app)
        .get('/api/profile')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').equal('Unauthorized');
          done();
        });
    });
  });
  
  describe('Redis', () => {
    it('should set and get a value from Redis', (done) => {
      client.set('key', 'value', (err, reply) => {
        expect(reply).to.equal('OK');
        client.get('key', (err, reply) => {
          expect(reply).to.equal('value');
          done();
        });
      });
    });
  });
});