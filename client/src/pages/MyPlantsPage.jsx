import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Plus, Calendar, MapPin, Eye } from 'lucide-react';
import { getPlants } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getStatusInfo, formatDate } from '../utils/statusUtils';
import './MyPlantsPage.css';

const PLANT_TYPE_LABELS = {
  lemon: 'לימון',
  olive: 'זית',
  apple: 'תפוח',
  pomegranate: 'רימון',
  grape: 'גפן',
  other: 'אחר',
};

export default function MyPlantsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlants();
  }, [user]);

  const loadPlants = async () => {
    try {
      const data = await getPlants(user?.id || 1);
      setPlants(data);
    } catch (err) {
      console.error('Failed to load plants:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="my-plants-page container">
        <div className="my-plants-login-prompt card">
          <Leaf size={48} className="prompt-icon" />
          <h2>הצמחים שלי</h2>
          <p>כדי לראות את הצמחים השמורים שלכם, יש להתחבר תחילה.</p>
          <Link to="/login" className="btn btn-primary">
            התחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-plants-page container">
      <div className="my-plants-header">
        <div>
          <h1>
            <Leaf size={28} style={{ verticalAlign: 'middle', marginLeft: 8 }} />
            הצמחים שלי
          </h1>
          <p>כל הצמחים ששמרתם במערכת</p>
        </div>
        <Link to="/check" className="btn btn-primary">
          <Plus size={18} />
          בדיקה חדשה
        </Link>
      </div>

      {loading ? (
        <p className="loading-text">טוען צמחים...</p>
      ) : plants.length === 0 ? (
        <div className="my-plants-empty card">
          <p>עדיין לא שמרתם צמחים.</p>
          <Link to="/check" className="btn btn-primary">התחילו בדיקה</Link>
        </div>
      ) : (
        <div className="plants-grid">
          {plants.map((plant) => {
            const status = plant.latestResult
              ? getStatusInfo(plant.latestResult.statusCode)
              : getStatusInfo('INCOMPLETE');

            return (
              <div key={plant.id} className="card plant-card">
                <div className="plant-card-image">
                  {plant.imageUrl ? (
                    <img src={plant.imageUrl} alt={plant.nickname} />
                  ) : (
                    <div className="plant-card-placeholder">
                      <Leaf size={40} />
                    </div>
                  )}
                </div>
                <div className="plant-card-body">
                  <div className="plant-card-top">
                    <h3 className="plant-card-name">{plant.nickname}</h3>
                    <span className={`badge ${status.badgeClass}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  <div className="plant-card-meta">
                    <span>
                      <Leaf size={14} />
                      {PLANT_TYPE_LABELS[plant.plantType] || plant.plantType}
                    </span>
                    <span>
                      <MapPin size={14} />
                      {plant.locationText}
                    </span>
                    {plant.latestResult?.nextRelevantDate && (
                      <span>
                        <Calendar size={14} />
                        {formatDate(plant.latestResult.nextRelevantDate)}
                      </span>
                    )}
                  </div>
                  <div className="plant-card-id">מזהה: {plant.publicPlantId}</div>
                  <div className="plant-card-footer">
                    <span className="plant-card-updated">
                      עודכן: {formatDate(plant.updatedAt)}
                    </span>
                    <Link to={`/plants/${plant.id}`} className="btn btn-sm btn-secondary">
                      <Eye size={14} />
                      פרטים
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
