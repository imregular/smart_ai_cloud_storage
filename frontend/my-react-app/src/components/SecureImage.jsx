import { useState, useEffect } from 'react';
import imageService from '../services/imageService';

const SecureImage = ({ imageId, alt, className }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchImage = async () => {
            try {
                const url = await imageService.getImageFile(imageId);
                if (active) {
                    setImageUrl(url);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Failed to load image', err);
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        if (imageId) {
            fetchImage();
        }

        return () => {
            active = false;
            // Clean up object URL to avoid memory leaks
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageId]);

    if (loading) {
        return <div className="photo-image skeleton-loader" style={{ background: '#1a1a2e', width: '100%', height: '200px' }}></div>;
    }

    if (error) {
        return <div className="photo-image error-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#252540' }}>Failed to load</div>;
    }

    return <img src={imageUrl} alt={alt} className={className} />;
};

export default SecureImage;
