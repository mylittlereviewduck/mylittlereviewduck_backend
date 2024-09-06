const EventSource = require('eventsource');

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHgiOiIzNDRlNzUzZS05MDcxLTQ3YjItYjY1MS1iYzMyYTBhOTJiMWYiLCJpYXQiOjE3MjU1MzQ2NDAsImV4cCI6MTcyNTU3Nzg0MH0.cijYOI_TzVyHSPKLr-30qXMIgR4IGGFfMuZpXx2QfCU`;

const es = new EventSource(
  `http://localhost:3000/sse?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHgiOiIzNDRlNzUzZS05MDcxLTQ3YjItYjY1MS1iYzMyYTBhOTJiMWYiLCJpYXQiOjE3MjU1MzQ2NDAsImV4cCI6MTcyNTU3Nzg0MH0.cijYOI_TzVyHSPKLr-30qXMIgR4IGGFfMuZpXx2QfCU`,
);

es.onmessage = function (event) {
  console.log('새로운 알림:', event.data);
};

es.onerror = function (err) {
  console.error('SSE 오류:', err);
};
