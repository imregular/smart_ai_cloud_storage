import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Demo photos from public folder
    const [photos] = useState([
        {
            id: 1,
            name: 'AI Neural Network',
            url: '/ai_cloud_photo_1_1769972402784.png',
            size: '2.4 MB',
            date: '2 days ago'
        },
        {
            id: 2,
            name: 'Cloud Computing',
            url: '/ai_cloud_photo_2_1769972419600.png',
            size: '3.1 MB',
            date: '5 days ago'
        },
        {
            id: 3,
            name: 'Digital Brain',
            url: '/ai_cloud_photo_3_1769972435224.png',
            size: '2.8 MB',
            date: '1 week ago'
        },
        {
            id: 4,
            name: 'Data Center',
            url: '/ai_cloud_photo_4_1769972451692.png',
            size: '3.5 MB',
            date: '2 weeks ago'
        }
    ]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUpload = () => {
        alert('Upload functionality coming soon! This is a demo interface.');
    };

    return (
        <div className="app-background">
            <div className="home-container">
                <div className="home-header">
                    <h1 className="home-title">My Cloud Storage</h1>
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="gallery-section">
                    <div className="gallery-header">
                        <h2 className="gallery-title">📸 My Photos</h2>
                        <button onClick={handleUpload} className="upload-btn">
                            <span>+</span>
                            Upload Photo
                        </button>
                    </div>

                    {photos.length > 0 ? (
                        <div className="photo-grid">
                            {photos.map((photo) => (
                                <div key={photo.id} className="photo-card">
                                    <img
                                        src={photo.url}
                                        alt={photo.name}
                                        className="photo-image"
                                    />
                                    <div className="photo-info">
                                        <div className="photo-name">{photo.name}</div>
                                        <div className="photo-meta">
                                            <span>{photo.size}</span>
                                            <span>{photo.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📁</div>
                            <div className="empty-text">No photos yet</div>
                            <div className="empty-subtext">
                                Upload your first photo to get started
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
