import { Link } from 'react-router-dom';
import { Leaf, HelpCircle, ChevronLeft } from 'lucide-react';
import './AboutPage.css';

const faqItems = [
  {
    q: 'מה עושה האתר הזה?',
    a: 'האתר מסייע לבדוק שאלות הלכתיות בסיסיות הקשורות לעצי פרי, כמו דיני עורלה. המערכת מנחה אתכם דרך שאלון ומציגה תוצאה ברורה עם מסלול ההחלטה.',
  },
  {
    q: 'האם התוצאה מהווה פסק הלכה?',
    a: 'לא. המערכת מספקת סיוע ראשוני בלבד. במקרה מעשי, חובה להתייעץ עם רב מוסמך.',
  },
  {
    q: 'מה זה עורלה?',
    a: 'עורלה היא איסור הלכתי על פירות עץ בשלוש השנים הראשונות לאחר נטיעתו. ישנם כללים מיוחדים להעברת עצים, עציצים, ומקרים נוספים.',
  },
  {
    q: 'האם אפשר להשתמש בלי הרשמה?',
    a: 'כן! אפשר להריץ בדיקה מלאה בלי חשבון. כדי לשמור צמחים ולעקוב אחריהם לאורך זמן, נדרשת הרשמה.',
  },
  {
    q: 'מה עושה העוזר ה-AI?',
    a: 'העוזר מאפשר לכם לתאר את המצב בשפה חופשית, והמערכת תזהה את הפרטים הרלוונטיים ותציע לכם למלא אותם בשאלון. הוא לא מחליף את מנוע החוקים.',
  },
  {
    q: 'האם מודול כלאיים זמין?',
    a: 'עדיין לא. מודול כלאיים נמצא בפיתוח ויהיה זמין בעתיד.',
  },
  {
    q: 'האם הנתונים שלי מאובטחים?',
    a: 'ב-MVP הנוכחי הנתונים נשמרים באופן זמני. בגרסאות עתידיות נוסיף אבטחה מלאה ואחסון מתמשך.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page container">
      <div className="about-header">
        <Leaf size={48} className="about-icon" />
        <h1>אודות</h1>
        <p>
          כלי עזר דיגיטלי לבדיקות הלכתיות בצמחים ועצי פרי
        </p>
      </div>

      <div className="about-section card">
        <h2>מה המטרה?</h2>
        <p>
          האתר נועד לסייע למשתמשים להבין את המצב ההלכתי של עצי פרי שברשותם,
          במיוחד בכל הנוגע לדיני עורלה. המערכת מנחה דרך שאלות פשוטות,
          מפעילה מנוע חוקים מוגדר, ומציגה תוצאה ברורה עם הסבר ויזואלי.
        </p>
        <p>
          <strong>חשוב:</strong> המידע הוא לסיוע כללי בלבד ואינו מהווה פסק הלכה.
        </p>
      </div>

      <div className="about-faq">
        <h2>
          <HelpCircle size={24} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
          שאלות נפוצות
        </h2>
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <details key={i} className="faq-item card">
              <summary className="faq-question">{item.q}</summary>
              <p className="faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="about-cta">
        <Link to="/check" className="btn btn-primary btn-lg">
          התחל בדיקה
          <ChevronLeft size={20} />
        </Link>
      </div>
    </div>
  );
}
