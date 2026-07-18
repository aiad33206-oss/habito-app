/* ==========================================================================
   TERMS & PRIVACY content
   NOTE: This is a reasonable starting template, not legal advice. Before
   real-world / Play Store publication, have it reviewed by a lawyer.
   ========================================================================== */
"use strict";

var TERMS_HTML_BY_LANG = {
en: '\
  <h4>Terms of Use</h4>\
  <p>Habito is a personal habit-tracking app. By creating an account or using the app as a guest, you agree to use it for lawful, personal purposes only.</p>\
  <p>You are responsible for the accuracy of the habits and data you enter. Habito is a self-improvement tool, not medical, psychological, or professional advice — for health-related habits, consult a qualified professional.</p>\
  <p>We may update these terms as the app evolves. Continued use after changes means you accept the updated terms.</p>\
  <h4>Privacy</h4>\
  <p>Your habit data (names, categories, daily check-ins) is stored securely in your personal account and is never shared with, or sold to, third parties.</p>\
  <p>We store your email (or anonymous session) only to identify your account. Optional profile fields — display name and avatar photo — are visible only to you.</p>\
  <p>You can export a full copy of your data at any time from Settings → Backup &amp; Restore, and request account deletion from Settings → Edit Profile.</p>\
  <h4>Contact</h4>\
  <p>Questions about these terms or your data can be sent to support@habito.app.</p>',

ar: '\
  <h4>شروط الاستخدام</h4>\
  <p>هابيتو تطبيق شخصي لتتبع العادات. باستخدامك الحساب أو الدخول كزائر، إنت موافق على استخدامه لأغراض شخصية وقانونية بس.</p>\
  <p>إنت مسؤول عن دقة العادات والبيانات اللي بتدخلها. هابيتو أداة لتطوير الذات، مش استشارة طبية أو نفسية أو مهنية — بالنسبة للعادات المرتبطة بالصحة، ارجع لمتخصص.</p>\
  <p>ممكن نحدّث الشروط دي مع تطور التطبيق. استمرارك في الاستخدام بعد أي تحديث معناه إنك موافق على النسخة الجديدة.</p>\
  <h4>الخصوصية</h4>\
  <p>بياناتك (أسماء العادات، الفئات، التسجيل اليومي) متخزنة بأمان في حسابك الشخصي ومش بتتشارك أو تتباع لأي طرف تالت.</p>\
  <p>بنخزن إيميلك (أو جلسة الزائر) بس عشان نتعرف على حسابك. الحقول الاختيارية زي اسم العرض وصورة البروفايل ظاهرة لك إنت بس.</p>\
  <p>تقدر تصدّر نسخة كاملة من بياناتك في أي وقت من الإعدادات ← نسخ احتياطي واستعادة، وتطلب حذف حسابك من الإعدادات ← تعديل البروفايل.</p>\
  <h4>التواصل</h4>\
  <p>أي أسئلة عن الشروط دي أو بياناتك ابعتيها على support@habito.app.</p>'
};
TERMS_HTML_BY_LANG.fr = TERMS_HTML_BY_LANG.en;
TERMS_HTML_BY_LANG.de = TERMS_HTML_BY_LANG.en;
TERMS_HTML_BY_LANG.zh = TERMS_HTML_BY_LANG.en;

function currentTermsHtml(){
  return TERMS_HTML_BY_LANG[cfg.lang] || TERMS_HTML_BY_LANG.en;
}
