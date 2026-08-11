import { useState, useEffect } from 'react';
import { fetchOrderMessages, sendOrderMessage } from '../services/api';

function OrderChat({ orderId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadMessages = async () => {
    if (!orderId) return;
    const res = await fetchOrderMessages(orderId);
    if (res.success && res.data) {
      setMessages(res.data);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [orderId, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setLoading(true);
    const role = currentUser?.role === 'admin' ? 'admin' : 'customer';
    const name = currentUser?.name || (role === 'admin' ? 'Bakery Owner' : 'Customer');

    const res = await sendOrderMessage(orderId, role, name, inputMsg.trim());
    setLoading(false);

    if (res.success) {
      setInputMsg('');
      loadMessages();
    }
  };

  return (
    <div className="order-chat-container" style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.8rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px solid var(--accent, #e91e63)',
          color: 'var(--accent, #e91e63)',
          padding: '0.4rem 0.8rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
      >
        💬 {isOpen ? 'Hide Order Discussion' : `Chat with ${currentUser?.role === 'admin' ? 'Customer' : 'Baker'} (${messages.length})`}
      </button>

      {isOpen && (
        <div className="order-chat-box" style={{
          marginTop: '0.8rem',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <div className="messages-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '0.8rem' }}>
            {messages.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>
                No messages yet. Send a message to start the discussion!
              </p>
            ) : (
              messages.map((m) => {
                const isAdmin = m.sender_role === 'admin';
                return (
                  <div key={m.id} style={{
                    marginBottom: '0.6rem',
                    textAlign: isAdmin ? 'right' : 'left'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: isAdmin ? '#e3f2fd' : '#fff0f5',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '8px',
                      maxWidth: '80%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isAdmin ? '#1976d2' : '#c2185b' }}>
                        {m.sender_name} ({isAdmin ? 'Bakery Owner' : 'Customer'})
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#333', marginTop: '0.2rem' }}>
                        {m.message}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '0.3rem', textAlign: 'right' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder={currentUser?.role === 'admin' ? "Type a reply to customer..." : "Ask bakery a question about this order..."}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '6px' }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default OrderChat;
