import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, Mic, Plus, Trash2, Edit, Eye } from 'lucide-react';
import { journalService, mediaService } from '../services/api';
import { useAuth } from '../components/AuthProvider';
import CreateJournalModal from '../components/CreateJournalModal';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [journals, setJournals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  // 获取所有日记
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const response = await journalService.getAll();
      if (response.success) {
        setJournals(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  // 文件转 base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 移除 "data:image/xxx;base64," 前缀，只保留 base64 内容
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // 创建日记（包含所有媒体）
  const handleCreateJournal = async (journalData, pendingCoverFile, mediaData, existingMedia) => {
    if (!user) {
      alert('Please login first');
      return { success: false };
    }

    try {
      // 构建请求数据
      const createData = {
        userId: user.id,
        title: journalData.title,
        description: journalData.description,
        coverImage: journalData.coverImage || '',
        recipe: journalData.recipe,
        // 新增媒体数据
        newMedia: mediaData,
      };

      // 如果有待上传的封面图
      if (pendingCoverFile) {
        createData.coverImageData = await fileToBase64(pendingCoverFile);
        createData.coverImageName = pendingCoverFile.name;
        createData.coverImageType = pendingCoverFile.type;
      }

      const response = await journalService.create(createData);
      
      if (response.success) {
        await fetchJournals();
        return { success: true, journalId: response.journal?.id };
      } else {
        alert(response.error || 'Failed to create journal');
        return { success: false };
      }
    } catch (error) {
      console.error('Error creating journal:', error);
      alert('Failed to create journal: ' + (error.message || 'Unknown error'));
      return { success: false };
    }
  };

  // 更新日记（包含所有媒体）
  const handleUpdateJournal = async (journalData, pendingCoverFile, mediaData, existingMedia) => {
    if (!user) {
      alert('Please login first');
      return { success: false };
    }

    try {
      const journalUserId = editingJournal.userId || user.id;
      
      // 构建请求数据
      const updateData = {
        id: editingJournal.id,
        userId: journalUserId,
        title: journalData.title,
        description: journalData.description,
        coverImage: journalData.coverImage || '',
        recipe: journalData.recipe,
        // 现有媒体（保留）
        existingMedia: existingMedia,
        // 新增媒体数据
        newMedia: mediaData,
      };

      // 如果有待上传的封面图
      if (pendingCoverFile) {
        updateData.coverImageData = await fileToBase64(pendingCoverFile);
        updateData.coverImageName = pendingCoverFile.name;
        updateData.coverImageType = pendingCoverFile.type;
      }

      const response = await journalService.update(updateData);
      
      if (response.success) {
        await fetchJournals();
        setEditingJournal(null);
        return { success: true };
      } else {
        alert(response.error || 'Failed to update journal');
        return { success: false };
      }
    } catch (error) {
      console.error('Error updating journal:', error);
      alert('Failed to update journal: ' + (error.message || 'Unknown error'));
      return { success: false };
    }
  };

  // 删除日记
  const handleDeleteJournal = async (journal) => {
    if (!user) {
      alert('Please login first');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this journal and all its media?')) return;
    
    try {
      const response = await journalService.delete(journal.id, journal.userId);
      
      if (response.success) {
        await fetchJournals();
      } else {
        alert(response.error || 'Failed to delete journal');
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      alert('Failed to delete journal: ' + (error.message || 'Unknown error'));
    }
  };

  const openEditModal = (journal) => {
    setEditingJournal(journal);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Share Your Culinary Journey
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            A multimedia social platform where food lovers create journals, share recipes, 
            upload photos and videos, and connect with fellow food enthusiasts around the world.
          </p>
          {isAuthenticated ? (
            <button
              onClick={() => {
                setEditingJournal(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-white text-flavor-orange font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Food Journal
            </button>
          ) : (
            <p className="text-white/80">Please sign in to create your food journal</p>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Image, title: 'Photos', desc: 'Upload food images', color: 'bg-orange-500' },
            { icon: Video, title: 'Videos', desc: 'Share cooking videos', color: 'bg-red-500' },
            { icon: Mic, title: 'Audio', desc: 'Record voice notes', color: 'bg-rose-500' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-lg card-hover flex items-center space-x-4"
            >
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journals Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Food Journals
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => {
                setEditingJournal(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-flavor-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Journal
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-flavor-orange border-t-transparent"></div>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">No journals yet. Create your first food journal!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden card-hover"
              >
                <div className="relative h-48">
                  <img
                    src={journal.coverImage || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400'}
                    alt={journal.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400';
                    }}
                  />
                  {isAuthenticated && user?.id === journal.userId && (
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <button
                        onClick={() => openEditModal(journal)}
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteJournal(journal)}
                        className="p-2 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                    {journal.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {journal.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Image className="w-3 h-3 mr-1" />
                        {journal.media?.photos?.length || 0}
                      </span>
                      <span className="flex items-center">
                        <Video className="w-3 h-3 mr-1" />
                        {journal.media?.videos?.length || 0}
                      </span>
                      <span className="flex items-center">
                        <Mic className="w-3 h-3 mr-1" />
                        {journal.media?.audio?.length || 0}
                      </span>
                    </div>
                    <Link
                      to={`/journal/${journal.id}?userId=${journal.userId}`}
                      className="flex items-center text-flavor-orange hover:text-orange-600 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create/Edit Modal */}
      <CreateJournalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJournal(null);
          fetchJournals();
        }}
        onSubmit={editingJournal ? handleUpdateJournal : handleCreateJournal}
        initialData={editingJournal}
      />
    </div>
  );
};

export default HomePage;
