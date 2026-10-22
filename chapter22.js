// بيانات إجابات الفصل 22 - Python
// عدّل هذا الملف فقط لإضافة/تعديل الإجابات، لا حاجة لتعديل أي ملف آخر.
// كل عنصر: { question: رقم السؤال, text: نص السؤال (اختياري), answer: الإجابة (كود), copy: true/false }

window.DATA = window.DATA || {};
window.DATA.python = window.DATA.python || {};

window.DATA.python[22] = [
  {
    question: 1,
    text: "",
    answer: `num = 1
for i in range(5):
    num = num * 7
print(num)`,
    copy: true
  },
  {
  question: 2,
  text: "",
  answer: `1->2->3->4->5->6->7`,
  copy: false
},
{
  question: 3,
  text: "",
  answer: `num = 5040
for i in range(1, 6):
    num = num / i
print(num)`,
  copy: true
},
{
  question: 4,
  text: "",
  answer: `mark_list = [48, 55, 74, 85, 63, 57, 91]
print(mark_list[5])`,
  copy: true
},
{
  question: 5,
  text: "",
  answer: `mark_list = [48, 55, 74, 85, 63, 57, 91]
print(len(mark_list))`,
  copy: true
},
{
  question: 7,
  text: "",
  answer: `mark_list = [48, 55, 74, 85, 63, 57, 91]
for i in range(len(mark_list)):
    if mark_list[i] >= 85:
        print("85 or above")`,
  copy: true
}
];
