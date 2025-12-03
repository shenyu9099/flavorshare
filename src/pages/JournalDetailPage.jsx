import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Image, Video, Mic, Edit, Trash2, Upload, Play, Clock, Users } from 'lucide-react';
import { journalService, mediaService } from '../services/api';
import { useAuth } from '../components/AuthProvider';
import CreateJournalModal from '../components/CreateJournalModal';

const JournalDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // 安全解析媒体数据（可能是字符串或数组）
  const parseMediaArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // 获取日记详情
  const fetchJournal = async () => {
    if (!id || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await journalService.getById(id, userId);
      if (response.success) {
        // 确保 media 数据格式正确
        const journalData = response.data;
        if (journalData.media) {
          journalData.media = {
            photos: parseMediaArray(journalData.media.photos),
            videos: parseMediaArray(journalData.media.videos),
            audio: parseMediaArray(journalData.media.audio),
          };
        } else {
          journalData.media = { photos: [], videos: [], audio: [] };
        }
        setJournal(journalData);
      }
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, [id, userId]);

  // 删除日记
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journal and all its media?')) return;

    try {
      const response = await journalService.delete(id, userId);
      if (response.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      alert('Failed to delete journal');
    }
  };

  // 上传媒体
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const response = await mediaService.upload(file, id, userId, activeTab);
      
      if (response.success) {
        await fetchJournal(); // 重新获取日记以更新媒体列表
        alert('Media uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAcceptType = () => {
    switch (activeTab) {
      case 'photos': return 'image/*';
      case 'videos': return 'video/*';
      case 'audio': return 'audio/*';
      default: return '*/*';
    }
  };

  // 只有日记所有者才能编辑和删除
  const isOwner = isAuthenticated && user?.id === journal?.userId;

  // 文件转 base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // 更新日记
  const handleUpdateJournal = async (journalData, pendingFile, mediaData, existingMedia) => {
    try {
      // 构建请求数据
      const updateData = {
        id: id,
        userId: userId,
        title: journalData.title,
        description: journalData.description,
        coverImage: journalData.coverImage || '',
        recipe: journalData.recipe,
      };

      // 如果有待上传的文件，转成 base64 传给 Logic App
      if (pendingFile) {
        updateData.coverImageData = await fileToBase64(pendingFile);
        updateData.coverImageName = pendingFile.name;
        updateData.coverImageType = pendingFile.type;
      }

      // 添加媒体数据
      if (mediaData) {
        updateData.newMedia = mediaData;
      }
      if (existingMedia) {
        updateData.existingMedia = existingMedia;
      }

      const response = await journalService.update(updateData);
      
      if (response.success) {
        await fetchJournal();
        setIsEditModalOpen(false);
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

  // 解析食谱数据（可能是字符串或对象）
  const parseRecipe = (recipe) => {
    if (!recipe) return null;
    if (typeof recipe === 'string') {
      try {
        return JSON.parse(recipe);
      } catch {
        return null;
      }
    }
    return recipe;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-flavor-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Journal not found</h2>
        <button onClick={() => navigate('/')} className="text-flavor-orange hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'photos', label: 'Photos', icon: Image, count: journal.media?.photos?.length || 0 },
    { key: 'videos', label: 'Videos', icon: Video, count: journal.media?.videos?.length || 0 },
    { key: 'audio', label: 'Audio', icon: Mic, count: journal.media?.audio?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96">
        <img 
          src={journal.coverImage || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'} 
          alt={journal.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{journal.title}</h1>
            <p className="text-white/80">{new Date(journal.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Description & Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-gray-600 mb-4">{journal.description || 'No description'}</p>
              {(() => {
                const recipe = parseRecipe(journal.recipe);
                if (!recipe) return null;
                const hasContent = recipe.ingredients || recipe.steps || recipe.cookingTime || recipe.servings;
                if (!hasContent) return null;
                
                return (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-lg mb-3">🍳 Recipe</h3>
                    
                    {/* 烹饪时间和份量 */}
                    {(recipe.cookingTime || recipe.servings) && (
                      <div className="flex space-x-6 mb-4 text-sm text-gray-600">
                        {recipe.cookingTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-flavor-orange" />
                            <span>{recipe.cookingTime}</span>
                          </div>
                        )}
                        {recipe.servings && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-flavor-orange" />
                            <span>{recipe.servings}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {recipe.ingredients && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Ingredients</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">{recipe.ingredients}</p>
                        </div>
                      )}
                      {recipe.steps && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Cooking Steps</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">{recipe.steps}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            {isOwner && (
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-flavor-orange transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-xl shadow-md p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-flavor-orange text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Media Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Upload Section */}
          {isOwner && (
            <div className="mb-4">
              {/* 检查当前 tab 是否有数据 */}
              {(journal.media?.[activeTab]?.length > 0) ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    💡 Uploaded files will be added directly to this journal
                  </p>
                  <div className="flex items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={getAcceptType()}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center px-4 py-2 bg-flavor-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : `Upload ${activeTab.slice(0, -1)}`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    💡 To upload {activeTab} here, please first add some via the{' '}
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="font-medium text-flavor-orange hover:underline"
                    >
                      Edit
                    </button>
                    {' '}button above.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {journal.media?.photos?.map((photo) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden">
                  <img src={photo.url} alt={photo.title} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-sm">{photo.title}</span>
                  </div>
                </div>
              ))}
              {(!journal.media?.photos || journal.media.photos.length === 0) && (
                <p className="col-span-full text-center text-gray-500 py-8">No photos yet. Upload your first photo!</p>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="grid md:grid-cols-2 gap-4">
              {journal.media?.videos?.map((video) => (
                <div key={video.id} className="rounded-lg overflow-hidden bg-gray-900">
                  <video 
                    src={video.url} 
                    controls 
                    className="w-full h-48 object-contain"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-3 bg-gray-50">
                    <p className="font-medium truncate">{video.title}</p>
                  </div>
                </div>
              ))}
              {(!journal.media?.videos || journal.media.videos.length === 0) && (
                <p className="col-span-full text-center text-gray-500 py-8">No videos yet. Upload your first video!</p>
              )}
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              {journal.media?.audio?.map((audio) => (
                <div key={audio.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{audio.title}</h4>
                    <audio src={audio.url} controls className="w-full mt-2" />
                  </div>
                </div>
              ))}
              {(!journal.media?.audio || journal.media.audio.length === 0) && (
                <p className="text-center text-gray-500 py-8">No audio notes yet. Upload your first audio!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CreateJournalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateJournal}
        initialData={{
          title: journal.title,
          description: journal.description,
          coverImage: journal.coverImage,
          recipe: parseRecipe(journal.recipe) || {
            ingredients: '',
            steps: '',
            cookingTime: '',
            servings: '',
          },
          media: journal.media || { photos: [], videos: [], audio: [] },
        }}
      />
    </div>
  );
};

export default JournalDetailPage;
