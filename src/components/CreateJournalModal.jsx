import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader, Image, Video, Mic, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const CreateJournalModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    recipe: {
      ingredients: '',
      steps: '',
      cookingTime: '',
      servings: '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [pendingCoverFile, setPendingCoverFile] = useState(null);
  
  // 媒体文件（待上传）
  const [pendingMedia, setPendingMedia] = useState({
    photos: [],  // { file, preview }
    videos: [],
    audio: [],
  });
  // 现有媒体（编辑时）
  const [existingMedia, setExistingMedia] = useState({
    photos: [],
    videos: [],
    audio: [],
  });
  
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // 解析 recipe
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

  // 解析 media
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

  useEffect(() => {
    if (initialData) {
      const recipe = parseRecipe(initialData.recipe);
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        coverImage: initialData.coverImage || '',
        recipe: {
          ingredients: recipe?.ingredients || '',
          steps: recipe?.steps || '',
          cookingTime: recipe?.cookingTime || '',
          servings: recipe?.servings || '',
        },
      });
      setPreviewImage(initialData.coverImage || '');
      setPendingCoverFile(null);
      // 加载现有媒体
      if (initialData.media) {
        setExistingMedia({
          photos: parseMediaArray(initialData.media.photos),
          videos: parseMediaArray(initialData.media.videos),
          audio: parseMediaArray(initialData.media.audio),
        });
      } else {
        setExistingMedia({ photos: [], videos: [], audio: [] });
      }
      setPendingMedia({ photos: [], videos: [], audio: [] });
    } else {
      setFormData({
        title: '',
        description: '',
        coverImage: '',
        recipe: { ingredients: '', steps: '', cookingTime: '', servings: '' },
      });
      setPreviewImage('');
      setPendingCoverFile(null);
      setExistingMedia({ photos: [], videos: [], audio: [] });
      setPendingMedia({ photos: [], videos: [], audio: [] });
    }
    setStep(1);
  }, [initialData, isOpen]);

  // 选择封面图
  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setPendingCoverFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData({ ...formData, coverImage: '' });
    };
    reader.readAsDataURL(file);

    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // 添加媒体文件
  const handleAddMedia = (e, mediaType) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件大小 (最大 50MB for video, 10MB for others)
    const maxSize = mediaType === 'videos' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size should be less than ${mediaType === 'videos' ? '50MB' : '10MB'}`);
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingMedia(prev => ({
        ...prev,
        [mediaType]: [...prev[mediaType], { file, preview: reader.result, name: file.name }]
      }));
    };
    
    if (mediaType === 'photos') {
      reader.readAsDataURL(file);
    } else {
      // 视频和音频不需要 base64 预览
      setPendingMedia(prev => ({
        ...prev,
        [mediaType]: [...prev[mediaType], { file, preview: null, name: file.name }]
      }));
    }

    // 清空 input
    if (mediaType === 'photos' && photoInputRef.current) photoInputRef.current.value = '';
    if (mediaType === 'videos' && videoInputRef.current) videoInputRef.current.value = '';
    if (mediaType === 'audio' && audioInputRef.current) audioInputRef.current.value = '';
  };

  // 移除待上传的媒体
  const handleRemovePendingMedia = (mediaType, index) => {
    setPendingMedia(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, i) => i !== index)
    }));
  };

  // 移除现有的媒体
  const handleRemoveExistingMedia = (mediaType, index) => {
    setExistingMedia(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, i) => i !== index)
    }));
  };

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

  // 最终提交
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // 构建媒体数据
      const mediaData = {
        photos: [],
        videos: [],
        audio: [],
      };

      // 处理待上传的媒体文件
      for (const item of pendingMedia.photos) {
        const base64 = await fileToBase64(item.file);
        mediaData.photos.push({
          fileName: item.name,
          fileContent: base64,
          contentType: item.file.type,
        });
      }
      for (const item of pendingMedia.videos) {
        const base64 = await fileToBase64(item.file);
        mediaData.videos.push({
          fileName: item.name,
          fileContent: base64,
          contentType: item.file.type,
        });
      }
      for (const item of pendingMedia.audio) {
        const base64 = await fileToBase64(item.file);
        mediaData.audio.push({
          fileName: item.name,
          fileContent: base64,
          contentType: item.file.type,
        });
      }

      // 调用父组件的提交方法
      const result = await onSubmit(formData, pendingCoverFile, mediaData, existingMedia);
      
      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to save journal');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalPendingMedia = pendingMedia.photos.length + pendingMedia.videos.length + pendingMedia.audio.length;
  const totalExistingMedia = existingMedia.photos.length + existingMedia.videos.length + existingMedia.audio.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-left transform transition-all max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 1 ? 'bg-flavor-orange text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-12 h-1 mx-2 ${step >= 2 ? 'bg-flavor-orange' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step >= 2 ? 'bg-flavor-orange text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>

          {/* 步骤1：基本信息 */}
          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">
            {initialData ? 'Edit Journal' : 'Create New Journal'}
          </h2>
              <p className="text-sm text-gray-500 text-center mb-4">Step 1: Basic Information</p>

              <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                placeholder="Enter journal title..."
                required
              />
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none resize-none"
                    rows={2}
                placeholder="Describe your culinary journey..."
                required
              />
            </div>

                {/* Recipe Section */}
                <div className="border-t pt-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">🍳 Recipe (Optional)</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                      type="text"
                      value={formData.recipe.cookingTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        recipe: { ...formData.recipe, cookingTime: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                      placeholder="Cooking time"
                />
                <input
                      type="text"
                      value={formData.recipe.servings}
                      onChange={(e) => setFormData({
                        ...formData,
                        recipe: { ...formData.recipe, servings: e.target.value }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                      placeholder="Servings"
                    />
                  </div>

                  <textarea
                    value={formData.recipe.ingredients}
                    onChange={(e) => setFormData({
                      ...formData,
                      recipe: { ...formData.recipe, ingredients: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none mb-2 focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                    rows={2}
                    placeholder="Ingredients..."
                  />

                  <textarea
                    value={formData.recipe.steps}
                    onChange={(e) => setFormData({
                      ...formData,
                      recipe: { ...formData.recipe, steps: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                    rows={2}
                    placeholder="Cooking steps..."
                  />
                </div>

                {/* Cover Image */}
                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={pendingCoverFile ? `📁 ${pendingCoverFile.name}` : formData.coverImage}
                      onChange={(e) => {
                        setPendingCoverFile(null);
                        setFormData({ ...formData, coverImage: e.target.value });
                        setPreviewImage(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-flavor-orange focus:border-transparent outline-none"
                      placeholder="Enter URL or upload"
                      readOnly={!!pendingCoverFile}
                    />
                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                <button
                  type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              {(previewImage || formData.coverImage) && (
                    <div className="mt-2 relative">
                  <img
                    src={previewImage || formData.coverImage}
                    alt="Preview"
                        className="w-full h-20 object-cover rounded-lg"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, coverImage: '' });
                          setPreviewImage('');
                          setPendingCoverFile(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title || !formData.description) {
                        alert('Please fill in title and description');
                        return;
                      }
                      setStep(2);
                    }}
                    className="flex-1 px-4 py-2 bg-flavor-orange text-white rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 步骤2：媒体上传 */}
          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">
                Add Media
              </h2>
              <p className="text-sm text-gray-500 text-center mb-4">Step 2: Upload Photos, Videos & Audio</p>

              {/* Hidden file inputs */}
              <input ref={photoInputRef} type="file" accept="image/*" onChange={(e) => handleAddMedia(e, 'photos')} className="hidden" />
              <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => handleAddMedia(e, 'videos')} className="hidden" />
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={(e) => handleAddMedia(e, 'audio')} className="hidden" />

              <div className="space-y-4">
                {/* Photos */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Image className="w-5 h-5 text-orange-500 mr-2" />
                      <span className="font-medium text-sm">Photos</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({existingMedia.photos.length + pendingMedia.photos.length})
                      </span>
                    </div>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {existingMedia.photos.map((photo, idx) => (
                      <div key={`existing-${idx}`} className="relative">
                        <img src={photo.url} alt="" className="w-12 h-12 object-cover rounded" />
                        <button
                          onClick={() => handleRemoveExistingMedia('photos', idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {pendingMedia.photos.map((item, idx) => (
                      <div key={`pending-${idx}`} className="relative">
                        <img src={item.preview} alt="" className="w-12 h-12 object-cover rounded border-2 border-orange-400" />
                        <button
                          onClick={() => handleRemovePendingMedia('photos', idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {existingMedia.photos.length === 0 && pendingMedia.photos.length === 0 && (
                      <span className="text-xs text-gray-400">No photos</span>
                    )}
                  </div>
                </div>

                {/* Videos */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Video className="w-5 h-5 text-red-500 mr-2" />
                      <span className="font-medium text-sm">Videos</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({existingMedia.videos.length + pendingMedia.videos.length})
                      </span>
                    </div>
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {existingMedia.videos.map((video, idx) => (
                      <div key={`existing-${idx}`} className="relative">
                        <div className="w-16 h-12 bg-gray-800 rounded flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => handleRemoveExistingMedia('videos', idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none"
                        >
                          ×
                        </button>
                        <span className="text-xs text-gray-500 truncate block w-16">{video.title}</span>
                      </div>
                    ))}
                    {pendingMedia.videos.map((item, idx) => (
                      <div key={`pending-${idx}`} className="relative">
                        <div className="w-16 h-12 bg-gray-800 rounded flex items-center justify-center border-2 border-red-400">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                        <button
                          onClick={() => handleRemovePendingMedia('videos', idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none"
                        >
                          ×
                        </button>
                        <span className="text-xs text-gray-500 truncate block w-16">{item.name}</span>
                      </div>
                    ))}
                    {existingMedia.videos.length === 0 && pendingMedia.videos.length === 0 && (
                      <span className="text-xs text-gray-400">No videos</span>
                    )}
                  </div>
                </div>

                {/* Audio */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Mic className="w-5 h-5 text-rose-500 mr-2" />
                      <span className="font-medium text-sm">Audio</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({existingMedia.audio.length + pendingMedia.audio.length})
                      </span>
                    </div>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-2 py-1 text-xs bg-rose-100 text-rose-600 rounded hover:bg-rose-200"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {existingMedia.audio.map((audio, idx) => (
                      <div key={`existing-${idx}`} className="flex items-center text-xs text-gray-600 bg-gray-50 p-1 rounded">
                        <Mic className="w-3 h-3 mr-1" />
                        {audio.title}
                      </div>
                    ))}
                    {pendingMedia.audio.map((item, idx) => (
                      <div key={`pending-${idx}`} className="flex items-center justify-between text-xs bg-rose-50 p-1 rounded">
                        <div className="flex items-center">
                          <Mic className="w-3 h-3 mr-1 text-rose-500" />
                          <span className="truncate max-w-[150px]">{item.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemovePendingMedia('audio', idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
            </div>

                <div className="flex space-x-3 pt-2">
              <button
                type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-flavor-orange text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                {initialData ? 'Update' : 'Create'}
                      </>
                    )}
              </button>
            </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJournalModal;
