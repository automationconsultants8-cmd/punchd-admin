import { useState, useEffect } from 'react';
import { messagesApi, usersApi } from '../services/api';
import './MessagesPage.css';
import { withFeatureGate } from '../components/FeatureGate';

function MessagesPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    body: '',
  });

 useEffect(() => {
  setMessages([]); // Clear messages immediately when tab changes
  loadData();
}, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let messagesRes;
      if (activeTab === 'inbox') {
        messagesRes = await messagesApi.getInbox();
      } else {
        messagesRes = await messagesApi.getSent();
      }

      const [workersRes, countRes] = await Promise.all([
        usersApi.getAll(),
        messagesApi.getUnreadCount(),
      ]);

      setMessages(messagesRes.data || []);
      setWorkers((workersRes.data || []).filter(w => w.isActive));
      setUnreadCount(typeof countRes.data === 'number' ? countRes.data : 0);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    if (!message.isRead && activeTab === 'inbox') {
      try {
        await messagesApi.markAsRead(message.id);
        loadData();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleCompose = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await messagesApi.send({
        recipientId: composeData.recipientId || null,
        subject: composeData.subject || null,
        body: composeData.body,
      });

      setShowComposeModal(false);
      setComposeData({ recipientId: '', subject: '', body: '' });
      setActiveTab('sent');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleDelete = async (e, messageId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    setDeleteLoading(messageId);
    try {
      await messagesApi.delete(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (showMessageModal && selectedMessage?.id === messageId) {
        setShowMessageModal(false);
        setSelectedMessage(null);
      }
    } catch (err) {
      setError('Failed to delete message');
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await messagesApi.markAllAsRead();
      loadData();
    } catch (err) {
      setError('Failed to mark messages as read');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="messages-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1>Messages</h1>
          <p>Communication with your team</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn-mark-read" onClick={handleMarkAllRead}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Mark all read
            </button>
          )}
          <button className="btn-compose" onClick={() => setShowComposeModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Compose
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
            Inbox
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Sent
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>No messages</h3>
            <p>
              {activeTab === 'inbox'
                ? 'No messages from workers yet'
                : 'You haven\'t sent any messages yet'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-card ${!message.isRead && activeTab === 'inbox' ? 'unread' : ''}`}
              onClick={() => openMessage(message)}
            >
              <div className="message-avatar" style={{ 
                background: activeTab === 'sent' 
                  ? 'linear-gradient(135deg, #C9A227, #E8D48A)' 
                  : 'linear-gradient(135deg, #4B7BB5, #6B8FC5)' 
              }}>
                {getInitials(activeTab === 'sent' ? message.recipient?.name : message.sender?.name)}
              </div>
              
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {activeTab === 'sent' 
                      ? (message.recipient?.name || 'All Workers')
                      : message.sender?.name}
                  </span>
                  {!message.isRead && activeTab === 'inbox' && (
                    <span className="unread-badge">New</span>
                  )}
                </div>
                
                {message.subject && (
                  <div className="message-subject">{message.subject}</div>
                )}
                
                <div className="message-preview">
                  {message.body.length > 100 
                    ? message.body.substring(0, 100) + '...' 
                    : message.body}
                </div>
              </div>

              <div className="message-meta">
                <span className="message-time">{getTimeAgo(message.createdAt)}</span>
                <button 
                  className="btn-delete-message"
                  onClick={(e) => handleDelete(e, message.id)}
                  disabled={deleteLoading === message.id}
                >
                  {deleteLoading === message.id ? '...' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="modal-overlay" onClick={() => setShowComposeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Message</h2>
              <button className="modal-close" onClick={() => setShowComposeModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCompose}>
              <div className="modal-body">
                <div className="form-group">
                  <label>To</label>
                  <select
                    value={composeData.recipientId}
                    onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                  >
                    <option value="">Select a worker...</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                  <small>Leave empty to broadcast to all workers</small>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Optional subject line..."
                  />
                </div>

                <div className="form-group">
                  <label>Message <span className="required">*</span></label>
                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    placeholder="Type your message..."
                    rows="5"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowComposeModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-send"
                  disabled={!composeData.body.trim()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMessage.subject || 'Message'}</h2>
              <button className="modal-close" onClick={() => setShowMessageModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="message-detail-header">
                <div className="message-detail-avatar" style={{ 
                  background: 'linear-gradient(135deg, #4B7BB5, #6B8FC5)' 
                }}>
                  {getInitials(selectedMessage.sender?.name)}
                </div>
                <div className="message-detail-info">
                  <div className="message-detail-sender">{selectedMessage.sender?.name}</div>
                  <div className="message-detail-date">{formatDate(selectedMessage.createdAt)}</div>
                </div>
              </div>

              <div className="message-detail-body">
                {selectedMessage.body}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-delete"
                onClick={(e) => handleDelete(e, selectedMessage.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowMessageModal(false)}
              >
                Close
              </button>
              <button
                className="btn-reply"
                onClick={() => {
                  setShowMessageModal(false);
                  setComposeData({
                    recipientId: selectedMessage.senderId,
                    subject: `Re: ${selectedMessage.subject || ''}`,
                    body: '',
                  });
                  setShowComposeModal(true);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 17 4 12 9 7"/>
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                </svg>
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withFeatureGate(MessagesPage, 'MESSAGES');