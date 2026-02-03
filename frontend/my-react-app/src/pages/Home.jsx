import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import imageService from '../services/imageService';
import SecureImage from '../components/SecureImage';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [filteredPhotos, setFilteredPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPhotos();
    }, []);

    // Effect for Search
    useEffect(() => {
        const performSearch = async () => {
            if (!searchTerm.trim()) {
                setFilteredPhotos(photos); // Show all if empty
                return;
            }

            setLoading(true);
            try {
                // Determine if query is purely text match or semantic
                // For now, ALWAYS use server semantic search for consistency
                // Or maybe local filter if it matches names?
                // Let's rely on server for "smart" results
                const results = await imageService.searchImages(searchTerm);

                // Map results to UI format
                const formattedResults = results.map(img => ({
                    id: img.id,
                    name: img.name || 'Unknown',
                    size: 'N/A', // Metadata might not have size
                    date: img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'N/A',
                    analysis: img.analysis,
                    processing: false
                }));
                setFilteredPhotos(formattedResults);

            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(performSearch, 500); // 500ms debounce
        return () => clearTimeout(debounce);

    }, [searchTerm, photos]); // dependency on photos ensures we reset if new upload

    const fetchPhotos = async () => {
        try {
            const userImages = await imageService.getUserImages();
            // Transform data to match UI expected format
            const formattedImages = userImages.map(img => ({
                id: img.id,
                name: img.originalName || img.filename,
                // url is handled by SecureImage using id
                size: (img.size / 1024 / 1024).toFixed(2) + ' MB',
                date: new Date(img.createdAt).toLocaleDateString(),
                analysis: img.analysis,
                processing: !img.aiProcessed
            }));
            setPhotos(formattedImages);
            setFilteredPhotos(formattedImages); // Initialize filtered list
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Validate type for all files
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith('image/')) {
                alert(`File "${files[i].name}" is not an image.`);
                return;
            }
        }

        setUploading(true);
        try {
            await imageService.uploadImage(files);
            await fetchPhotos(); // Refresh list
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Unknown upload error';
            alert(`Failed to upload images: ${errorMessage}`);
            if (error.response?.data?.details) {
                console.error('Error details:', error.response.data.details);
            }
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };



    // Filter logic moved to useEffect

    return (
        <>
            <div className="app-background" />
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
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="🔍 Search photos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    width: '250px'
                                }}
                            />
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    multiple
                                />
                                <button onClick={handleUploadClick} className="upload-btn" disabled={uploading}>
                                    <span>{uploading ? '⏳' : '+'}</span>
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading photos...</div>
                    ) : filteredPhotos.length > 0 ? (
                        <div className="photo-grid">
                            {filteredPhotos.map((photo) => (
                                <div key={photo.id} className="photo-card">
                                    <SecureImage
                                        imageId={photo.id}
                                        alt={photo.name}
                                        className="photo-image"
                                    />
                                    <div className="photo-info">
                                        <div className="photo-name">{photo.name}</div>

                                        {photo.analysis && (
                                            <div className="photo-analysis">
                                                <span className="ai-icon">✨</span> {photo.analysis}
                                            </div>
                                        )}
                                        {photo.processing && (
                                            <div className="photo-processing">
                                                <span className="spinner-small"></span> Analyzing...
                                            </div>
                                        )}

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
                            <div className="empty-icon">
                                {searchTerm ? '🔍' : '📁'}
                            </div>
                            <div className="empty-text">
                                {searchTerm ? `No photos found for "${searchTerm}"` : 'No photos yet'}
                            </div>
                            <div className="empty-subtext">
                                {searchTerm ? 'Try a different search term' : 'Upload your first photo to get started'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
