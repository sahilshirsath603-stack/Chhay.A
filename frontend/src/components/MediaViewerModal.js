import React, { useEffect, useState } from 'react';

const MediaViewerModal = ({ mediaMessages, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, startIndex || 0));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < mediaMessages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!mediaMessages || mediaMessages.length === 0) return null;

  const currentMedia = mediaMessages[currentIndex];

  if (!currentMedia) return null;

  const handleDownload = async () => {
    const mediaUrl = currentMedia.fileUrl || currentMedia.url;
    const filename = currentMedia.filename ||
      (mediaUrl ? mediaUrl.split('/').pop() : null) ||
      (currentMedia.type === 'image' ? 'image.jpg' : 'video.mp4');

    try {
      const response = await fetch(mediaUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(mediaUrl, '_blank');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.downloadBtn} onClick={handleDownload}>⬇</button>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button style={{ ...styles.navBtn, left: 10 }} onClick={navigatePrevious}>
            ‹
          </button>
        )}
        {currentIndex < mediaMessages.length - 1 && (
          <button style={{ ...styles.navBtn, right: 10 }} onClick={navigateNext}>
            ›
          </button>
        )}

        <div style={styles.mediaContainer}>
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.fileUrl || currentMedia.url}
              alt="Media"
              style={styles.media}
            />
          ) : currentMedia.type === 'video' ? (
            <video
              src={currentMedia.fileUrl || currentMedia.url}
              controls
              autoPlay
              style={styles.media}
            />
          ) : null}
        </div>

        {/* Media Counter */}
        <div style={styles.counter}>
          {currentIndex + 1} / {mediaMessages.length}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    cursor: 'pointer'
  },
  modal: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'default'
  },
  downloadBtn: {
    position: 'absolute',
    top: 10,
    right: 60,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    cursor: 'pointer',
    zIndex: 1
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    cursor: 'pointer',
    zIndex: 1
  },
  mediaContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    maxHeight: '100%'
  },
  media: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 50,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    cursor: 'pointer',
    zIndex: 1
  },
  counter: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 14,
    zIndex: 1
  }
};

export default MediaViewerModal;
