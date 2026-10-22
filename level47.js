// بيانات إجابات المستوى 47 - JavaScript
// عدّل هذا الملف فقط لإضافة/تعديل الإجابات، لا حاجة لتعديل أي ملف آخر.
// كل عنصر: { question: رقم السؤال, text: نص السؤال (اختياري), answer: الإجابة (كود), copy: true/false }

window.DATA = window.DATA || {};
window.DATA.javascript = window.DATA.javascript || {};

window.DATA.javascript[47] = [
  {
    question: 1,
    text: "",
    answer: `const weather = "sunny";

switch (weather) {
  case "sunny":
    console.log("Let's go shopping");
    break;
  case "cloudy":
    console.log("Let's go shopping");
    break;
  case "rainy":
    console.log("Let's stay home");
    break;
}`,
    copy: true
  },
  {
  question: 2,
  text: "",
  answer: `const weather = "sunny";

switch (weather) {
  case "sunny":
  case "cloudy":
    console.log("Let's go shopping");
    break;
  case "rainy":
    console.log("Let's stay home");
    break;
}`,
  copy: true
},
{
  question: 3,
  text: "",
  answer: `strawberry
orange
apple`,
  copy: false
},
{
  question: 4,
  text: "",
  answer: `for (let i = 1; i <= 10; i++) {
  switch (i % 3) {
    case 0:
      console.log("Student " + i + " is in Group C");
      break;
    case 1:
      console.log("Student " + i + " is in Group A");
      break;
    case 2:
      console.log("Student " + i + " is in Group B");
      break;
  }
}`,
  copy: true
},
{
  question: 5,
  text: "",
  answer: `No output`,
  copy: false
},
];
