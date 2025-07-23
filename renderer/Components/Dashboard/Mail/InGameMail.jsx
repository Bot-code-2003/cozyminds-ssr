import React, { useState, useEffect } from 'react';
import { Mail, X, Inbox, Trash2, Star } from "lucide-react";
import { useMails } from "../../../context/MailContext";
import { marked } from 'marked';

const InGameMail = ({ closeModal }) => {
  const { mails, user, error, claimReward, markAsRead, deleteMail } = useMails();
  const [selectedMail, setSelectedMail] = useState(null);
  const [mailStateError, setMailStateError] = useState(null);
  const [claimingReward, setClaimingReward] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [activeView, setActiveView] = useState('inbox');
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial selected mail
  useEffect(() => {
    if (mails.length > 0 && !selectedMail) {
      setSelectedMail(mails[0]);
    } else if (mails.length === 0) {
      setSelectedMail(null);
    }
  }, [mails, selectedMail]);

  // Handle mail selection
  const handleSelectMail = async (mail) => {
    setSelectedMail(mail);
    if (!mail.read) {
      try {
        await markAsRead(mail.id);
      } catch (err) {
        setMailStateError(err.message);
      }
    }
    if (isMobile) {
      setActiveView('detail');
    }
  };

  // Handle back to inbox on mobile
  const handleBackToInbox = () => {
    setActiveView('inbox');
  };

  // Handle claim reward
  const handleClaimReward = async (mailId) => {
    try {
      setClaimingReward(true);
      setMailStateError(null);
      setClaimSuccess(null);

      const message = await claimReward(mailId);

      setSelectedMail(prev => prev && prev.id === mailId ? { ...prev, rewardClaimed: true, read: true } : prev);
      setClaimSuccess(message);
    } catch (err) {
      setMailStateError(err.message);
    } finally {
      setClaimingReward(false);
    }
  };

  // Handle delete mail
  const handleDeleteMail = async (mailId) => {
    try {
      await deleteMail(mailId);
      if (selectedMail && selectedMail.id === mailId) {
        const updatedMails = mails.filter(m => m.id !== mailId);
        setSelectedMail(updatedMails.length > 0 ? updatedMails[0] : null);
        if (isMobile) {
          setActiveView('inbox');
        }
      }
    } catch (err) {
      setMailStateError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="text-lg font-medium text-black">Mail</h2>
              <p className="text-sm text-gray-500">{mails.length} messages</p>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close mailbox"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Mobile View */}
        {isMobile ? (
          <div className="flex-1 overflow-hidden">
            {activeView === 'inbox' ? (
              // Mobile Inbox
              <div className="h-full overflow-y-auto">
                {mails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
                    <Inbox size={32} className="mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2 text-black">No mail yet</h3>
                    <p className="text-sm text-center text-gray-500">Your messages will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {mails.map(mail => (
                      <div
                        key={mail.id}
                        onClick={() => handleSelectMail(mail)}
                        className={`px-6 py-4 cursor-pointer transition-colors ${
                          !mail.read 
                            ? 'bg-gray-50 hover:bg-gray-100' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm font-medium truncate ${
                                !mail.read ? 'text-black' : 'text-gray-700'
                              }`}>
                                {mail.title}
                              </h3>
                              {['streak', 'milestone', 'reward'].includes(mail.mailType) && mail.rewardAmount > 0 && !mail.rewardClaimed && (
                                <span className="text-yellow-500 text-xs">✨</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{mail.sender}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              {new Date(mail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {!mail.read && <span className="w-2 h-2 bg-black rounded-full flex-shrink-0"></span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Mobile Detail View
              <div className="flex flex-col h-full">
                <button
                  onClick={handleBackToInbox}
                  className="flex items-center gap-2 px-6 py-3 text-black border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium">← Back</span>
                </button>
                {selectedMail ? (
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-xl font-medium text-black leading-tight">
                          {selectedMail.title}
                        </h2>
                        {['streak', 'milestone', 'reward'].includes(selectedMail.mailType) && selectedMail.rewardAmount > 0 && !selectedMail.rewardClaimed && (
                          <span className="text-yellow-500 ml-2 flex-shrink-0">✨</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>From: <span className="text-black">{selectedMail.sender}</span></p>
                        <p>{new Date(selectedMail.date).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</p>
                      </div>
                    </div>
                    
                    <div
                      className="prose prose-sm max-w-none text-gray-700 mb-6"
                      dangerouslySetInnerHTML={{ __html: marked.parse(selectedMail.content || '') }}
                    />
                    
                    {['streak', 'milestone', 'reward'].includes(selectedMail.mailType) && selectedMail.rewardAmount > 0 && (
                      <div className="mb-6">
                        {selectedMail.rewardClaimed ? (
                          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <Star size={16} className="text-green-600" />
                            <p className="text-green-700 text-sm font-medium">
                              Claimed {selectedMail.rewardAmount} coins!
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimReward(selectedMail.id)}
                            disabled={claimingReward}
                            className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Star size={16} />
                            {claimingReward ? 'Claiming...' : `Claim ${selectedMail.rewardAmount} Coins`}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {mailStateError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{mailStateError}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMail(selectedMail.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Select a mail to view</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Desktop View
          <div className="flex flex-1 overflow-hidden">
            {/* Mail List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
              {mails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
                  <Inbox size={32} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2 text-black">No mail yet</h3>
                  <p className="text-sm text-center text-gray-500">Your messages will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {mails.map(mail => (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectMail(mail)}
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        selectedMail?.id === mail.id 
                          ? 'bg-white border-r-2 border-black' 
                          : !mail.read 
                            ? 'bg-gray-100 hover:bg-white' 
                            : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm font-medium truncate ${
                              selectedMail?.id === mail.id
                                ? 'text-black'
                                : !mail.read 
                                  ? 'text-black' 
                                  : 'text-gray-700'
                            }`}>
                              {mail.title}
                            </h3>
                            {['streak', 'milestone', 'reward'].includes(mail.mailType) && mail.rewardAmount > 0 && !mail.rewardClaimed && (
                              <span className="text-yellow-500 text-xs">✨</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">{mail.sender}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <p className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(mail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          {!mail.read && <span className="w-2 h-2 bg-black rounded-full flex-shrink-0"></span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mail Detail */}
            <div className="flex-1 overflow-y-auto">
              {selectedMail ? (
                <div className="h-full flex flex-col">
                  <div className="px-8 py-6 border-b border-gray-200 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-medium text-black leading-tight">
                        {selectedMail.title}
                      </h2>
                      {['streak', 'milestone', 'reward'].includes(selectedMail.mailType) && selectedMail.rewardAmount > 0 && !selectedMail.rewardClaimed && (
                        <span className="text-yellow-500 ml-3 flex-shrink-0">✨</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>From: <span className="text-black font-medium">{selectedMail.sender}</span></p>
                      <p>{new Date(selectedMail.date).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-8 py-6">
                    <div
                      className="prose prose-sm max-w-none text-gray-700 mb-6"
                      dangerouslySetInnerHTML={{ __html: marked.parse(selectedMail.content || '') }}
                    />
                    
                    {['streak', 'milestone', 'reward'].includes(selectedMail.mailType) && selectedMail.rewardAmount > 0 && (
                      <div className="mb-6">
                        {selectedMail.rewardClaimed ? (
                          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <Star size={20} className="text-green-600" />
                            <p className="text-green-700 font-medium">
                              Claimed {selectedMail.rewardAmount} coins!
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimReward(selectedMail.id)}
                            disabled={claimingReward}
                            className="px-6 py-3 bg-black text-white rounded-lg font-medium transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Star size={18} />
                            {claimingReward ? 'Claiming...' : `Claim ${selectedMail.rewardAmount} Coins`}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {mailStateError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700">{mailStateError}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMail(selectedMail.id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      <span className="font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Mail size={32} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2 text-black">Select a message</h3>
                  <p className="text-sm text-gray-500">Choose a mail from the list to read</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .prose a {
          color: #000 !important;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #374151 !important;
        }
        .prose strong, .prose b {
          color: #000 !important;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #000 !important;
        }
        .prose blockquote {
          color: #374151 !important;
          border-left: 4px solid #000 !important;
          background: #f9fafb !important;
        }
        .view-journal-btn {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
};

export default InGameMail;