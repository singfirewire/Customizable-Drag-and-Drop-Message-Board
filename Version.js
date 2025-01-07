/// v.18
import React, { useState, useMemo } from 'react';
import { X, Edit2, ChevronDown, Clock, User } from 'lucide-react';

const BOX_TYPES = {
  heading: { name: 'หัวข้อ', bgColor: 'bg-white' },
  narrative: { name: 'บทบรรยาย', bgColor: 'bg-blue-50' },
  interview: { name: 'สัมภาษณ์', bgColor: 'bg-green-50' },
  command: { name: 'คำสั่งพิเศษ', bgColor: 'bg-yellow-50' },
  comment: { name: 'ความเห็น', bgColor: 'bg-purple-50' }
};

const formatTimecode = (value) => {
  // ตัดอักขระที่ไม่ใช่ตัวเลขออก
  const numbers = value.replace(/[^\d]/g, '');
  
  // จัดรูปแบบเป็น 00:00:00,000
  if (numbers.length > 0) {
    const padded = numbers.padEnd(9, '0').slice(0, 9);
    const hh = padded.slice(0, 2);
    const mm = padded.slice(2, 4);
    const ss = padded.slice(4, 6);
    const ms = padded.slice(6);
    return `${hh}:${mm}:${ss},${ms}`;
  }
  return '00:00:00,000';
};

const calculateReadingTime = (content) => {
  if (!content) return { words: 0, time: 0 };
  const text = typeof content === 'object' ? content.additionalInfo || '' : content;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = wordCount / 200;
  return { words: wordCount, time: minutes };
};

const formatReadingTime = (minutes) => {
  if (minutes < 1) {
    return `${Math.ceil(minutes * 60)} วินาที`;
  }
  if (minutes >= 1) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) {
      return `${mins} นาที`;
    }
    return `${mins} นาที ${secs} วินาที`;
  }
  return '0 วินาที';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
};

const TextBox = ({ 
  id, 
  content, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDelete, 
  type, 
  onContentChange,
  lastEdited 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(
    type === 'interview' 
      ? (typeof content === 'object' ? content : {
          fullName: '',
          position: '',
          interviewTime: '00:00:00,000',
          additionalInfo: ''
        })
      : content
  );

  const readingStats = useMemo(() => 
    calculateReadingTime(currentContent),
    [currentContent]
  );

  const handleSave = () => {
    onContentChange(id, currentContent);
    setIsEditing(false);
  };

  const handleInterviewFieldChange = (field, value) => {
    if (field === 'interviewTime') {
      value = formatTimecode(value);
    }
    setCurrentContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`${BOX_TYPES[type].bgColor} p-4 rounded-lg shadow-md mb-4 w-full max-w-4xl cursor-move relative group`}
    >
      {/* Control buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {lastEdited && (
          <span className="text-xs text-gray-400">
            แก้ไขล่าสุด {formatDate(lastEdited)}
          </span>
        )}
        <button 
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <Edit2 size={16} />
          <span className="text-xs">Edit</span>
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500"
        >
          <X size={18} />
        </button>
      </div>

      <h3 className="font-bold text-lg mb-4 mt-2">{BOX_TYPES[type].name}</h3>

      {isEditing ? (
        <div className="space-y-2">
          {type === 'interview' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={currentContent.fullName}
                  onChange={(e) => handleInterviewFieldChange('fullName', e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  placeholder="ชื่อ-นามสกุลผู้ให้สัมภาษณ์"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={currentContent.position}
                  onChange={(e) => handleInterviewFieldChange('position', e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  placeholder="ตำแหน่ง"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timecode</label>
                <input
                  type="text"
                  value={currentContent.interviewTime}
                  onChange={(e) => handleInterviewFieldChange('interviewTime', e.target.value)}
                  className="w-full p-2 border rounded bg-white font-mono"
                  placeholder="00:00:00,000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เพิ่มเติม</label>
                <textarea
                  value={currentContent.additionalInfo}
                  onChange={(e) => handleInterviewFieldChange('additionalInfo', e.target.value)}
                  className="w-full p-2 border rounded bg-white min-h-[100px]"
                  placeholder="ข้อมูลเพิ่มเติม..."
                />
              </div>
            </div>
          ) : (
            <textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full p-2 border rounded bg-white min-h-[100px]"
              placeholder={`ใส่เนื้อหา${BOX_TYPES[type].name}...`}
            />
          )}
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            บันทึก
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {type === 'interview' ? (
            <div className="space-y-2">
              {currentContent.fullName && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={16} className="text-gray-400" />
                  <p className="font-medium">{currentContent.fullName}</p>
                  <span className="text-gray-400">·</span>
                  <p className="text-gray-500">{currentContent.position}</p>
                </div>
              )}
              {currentContent.interviewTime && (
                <p className="text-sm text-gray-500 font-mono">
                  Timecode: {currentContent.interviewTime}
                </p>
              )}
              <div className="mt-4 whitespace-pre-wrap">
                {currentContent.additionalInfo || (
                  <span className="text-gray-400">คลิก Edit เพื่อเพิ่มเนื้อหา</span>
                )}
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {currentContent || <span className="text-gray-400">คลิก Edit เพื่อเพิ่มเนื้อหา</span>}
            </div>
          )}
        </div>
      )}

      {(type === 'interview' ? currentContent.additionalInfo : currentContent) && (
        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <Clock size={12} />
          <span>เวลาในการอ่าน: {formatReadingTime(readingStats.time)} ({readingStats.words} คำ)</span>
        </div>
      )}
    </div>
  );
};

const AddButton = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-2 mb-8 bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600"
      >
        + เพิ่มกล่องข้อความ
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 z-10"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {Object.entries(BOX_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                onAdd(key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:${value.bgColor}`}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Board = () => {
  const [boxes, setBoxes] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const items = Array.from(boxes);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);

    setBoxes(items);
    setDraggedIndex(null);
  };

  const handleDelete = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const handleContentChange = (id, newContent) => {
    setBoxes(boxes.map(box => 
      box.id === id 
        ? { ...box, content: newContent, lastEdited: new Date().toISOString() } 
        : box
    ));
  };

  const addNewBox = (type) => {
    const newBox = {
      id: String(boxes.length + 1),
      content: type === 'interview' ? {
        fullName: '',
        position: '',
        interviewTime: '00:00:00,000',
        additionalInfo: ''
      } : '',
      type: type,
      lastEdited: null
    };
    setBoxes([...boxes, newBox]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AddButton onAdd={addNewBox} />
        
        <div className="flex flex-col gap-4 items-start">
          {boxes.map((box, index) => (
            <TextBox
              key={box.id}
              {...box}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={handleDelete}
              onContentChange={handleContentChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;

/////
//V.15
import React, { useState, useMemo } from 'react';
import { X, Edit2, ChevronDown, Clock, User } from 'lucide-react';

const BOX_TYPES = {
  heading: { name: 'หัวข้อ', bgColor: 'bg-white' },
  narrative: { name: 'บทบรรยาย', bgColor: 'bg-blue-50' },
  interview: { name: 'สัมภาษณ์', bgColor: 'bg-green-50' },
  command: { name: 'คำสั่งพิเศษ', bgColor: 'bg-yellow-50' },
  comment: { name: 'ความเห็น', bgColor: 'bg-purple-50' }
};

const calculateReadingTime = (content) => {
  if (!content) return { words: 0, time: 0 };
  const text = typeof content === 'object' ? content.additionalInfo || '' : content;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = wordCount / 200;
  return { words: wordCount, time: minutes };
};

const formatReadingTime = (minutes) => {
  if (minutes < 1) {
    return `${Math.ceil(minutes * 60)} วินาที`;
  }
  if (minutes >= 1) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) {
      return `${mins} นาที`;
    }
    return `${mins} นาที ${secs} วินาที`;
  }
  return '0 วินาที';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
};

const TextBox = ({ 
  id, 
  content, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDelete, 
  type, 
  onContentChange,
  lastEdited 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(
    type === 'interview' 
      ? (typeof content === 'object' ? content : { 
          fullName: '',
          position: '',
          interviewTime: '',
          additionalInfo: ''
        })
      : content
  );

  const readingStats = useMemo(() => 
    calculateReadingTime(currentContent),
    [currentContent]
  );

  const handleSave = () => {
    onContentChange(id, currentContent);
    setIsEditing(false);
  };

  const handleInterviewFieldChange = (field, value) => {
    setCurrentContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`${BOX_TYPES[type].bgColor} p-4 rounded-lg shadow-md mb-4 w-full max-w-4xl cursor-move relative group`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {lastEdited && (
          <span className="text-xs text-gray-400">
            แก้ไขล่าสุด {formatDate(lastEdited)}
          </span>
        )}
        <button 
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <Edit2 size={16} />
          <span className="text-xs">Edit</span>
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500"
        >
          <X size={18} />
        </button>
      </div>

      <h3 className="font-bold text-lg mb-4 mt-2">{BOX_TYPES[type].name}</h3>

      {isEditing ? (
        <div className="space-y-2">
          {type === 'interview' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={currentContent.fullName}
                  onChange={(e) => handleInterviewFieldChange('fullName', e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  placeholder="ชื่อ-นามสกุลผู้ให้สัมภาษณ์"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ตำแหน่ง</label>
                <input
                  type="text"
                  value={currentContent.position}
                  onChange={(e) => handleInterviewFieldChange('position', e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                  placeholder="ตำแหน่ง"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เวลาที่ให้สัมภาษณ์</label>
                <input
                  type="datetime-local"
                  value={currentContent.interviewTime}
                  onChange={(e) => handleInterviewFieldChange('interviewTime', e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เพิ่มเติม</label>
                <textarea
                  value={currentContent.additionalInfo}
                  onChange={(e) => handleInterviewFieldChange('additionalInfo', e.target.value)}
                  className="w-full p-2 border rounded bg-white min-h-[100px]"
                  placeholder="ข้อมูลเพิ่มเติม..."
                />
              </div>
            </div>
          ) : (
            <textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full p-2 border rounded bg-white min-h-[100px]"
              placeholder={`ใส่เนื้อหา${BOX_TYPES[type].name}...`}
            />
          )}
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            บันทึก
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {type === 'interview' ? (
            <div className="space-y-2">
              {currentContent.fullName && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={16} className="text-gray-400" />
                  <p className="font-medium">{currentContent.fullName}</p>
                  <span className="text-gray-400">·</span>
                  <p className="text-gray-500">{currentContent.position}</p>
                </div>
              )}
              {currentContent.interviewTime && (
                <p className="text-sm text-gray-500">
                  เวลาสัมภาษณ์: {formatDate(currentContent.interviewTime)}
                </p>
              )}
              <div className="mt-4 whitespace-pre-wrap">
                {currentContent.additionalInfo || (
                  <span className="text-gray-400">คลิก Edit เพื่อเพิ่มเนื้อหา</span>
                )}
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {currentContent || <span className="text-gray-400">คลิก Edit เพื่อเพิ่มเนื้อหา</span>}
            </div>
          )}
        </div>
      )}

      {(type === 'interview' ? currentContent.additionalInfo : currentContent) && (
        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <Clock size={12} />
          <span>เวลาในการอ่าน: {formatReadingTime(readingStats.time)} ({readingStats.words} คำ)</span>
        </div>
      )}
    </div>
  );
};

// AddButton component remains the same
const AddButton = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-2 mb-8 bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600"
      >
        + เพิ่มกล่องข้อความ
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 z-10"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {Object.entries(BOX_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                onAdd(key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:${value.bgColor}`}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Board = () => {
  const [boxes, setBoxes] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const items = Array.from(boxes);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);

    setBoxes(items);
    setDraggedIndex(null);
  };

  const handleDelete = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const handleContentChange = (id, newContent) => {
    setBoxes(boxes.map(box => 
      box.id === id 
        ? { ...box, content: newContent, lastEdited: new Date().toISOString() } 
        : box
    ));
  };

  const addNewBox = (type) => {
    const newBox = {
      id: String(boxes.length + 1),
      content: type === 'interview' ? {
        fullName: '',
        position: '',
        interviewTime: '',
        additionalInfo: ''
      } : '',
      type: type,
      lastEdited: null
    };
    setBoxes([...boxes, newBox]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AddButton onAdd={addNewBox} />
        
        <div className="flex flex-col gap-4 items-start">
          {boxes.map((box, index) => (
            <TextBox
              key={box.id}
              {...box}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={handleDelete}
              onContentChange={handleContentChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
////////////////
//v.14

import React, { useState, useMemo } from 'react';
import { X, Edit2, ChevronDown, Clock } from 'lucide-react';

const BOX_TYPES = {
  heading: { name: 'หัวข้อ', bgColor: 'bg-white' },
  narrative: { name: 'บทบรรยาย', bgColor: 'bg-blue-50' },
  interview: { name: 'สัมภาษณ์', bgColor: 'bg-green-50' },
  command: { name: 'คำสั่งพิเศษ', bgColor: 'bg-yellow-50' },
  comment: { name: 'ความเห็น', bgColor: 'bg-purple-50' }
};

// คำนวณเวลาในการอ่าน
const calculateReadingTime = (content) => {
  if (!content) return { words: 0, time: 0 };
  
  // นับจำนวนคำโดยประมาณ (แยกด้วยช่องว่าง)
  const wordCount = content.trim().split(/\s+/).length;
  
  // คำนวณเวลา (ใช้อัตรา 200 คำต่อนาที)
  const minutes = wordCount / 200;
  
  return {
    words: wordCount,
    time: minutes
  };
};

// Format time helper
const formatReadingTime = (minutes) => {
  if (minutes < 1) {
    return `${Math.ceil(minutes * 60)} วินาที`;
  }
  if (minutes >= 1) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) {
      return `${mins} นาที`;
    }
    return `${mins} นาที ${secs} วินาที`;
  }
  return '0 วินาที';
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  });
};

const TextBox = ({ 
  id, 
  content, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDelete, 
  type, 
  onContentChange,
  lastEdited 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);

  const readingStats = useMemo(() => 
    calculateReadingTime(currentContent),
    [currentContent]
  );

  const handleSave = () => {
    onContentChange(id, currentContent);
    setIsEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`${BOX_TYPES[type].bgColor} p-4 rounded-lg shadow-md mb-4 w-full max-w-4xl cursor-move relative group`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {lastEdited && (
          <span className="text-xs text-gray-400">
            แก้ไขล่าสุด {formatDate(lastEdited)}
          </span>
        )}
        <button 
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <Edit2 size={16} />
          <span className="text-xs">Edit</span>
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500"
        >
          <X size={18} />
        </button>
      </div>

      <h3 className="font-bold text-lg mb-4 mt-2">{BOX_TYPES[type].name}</h3>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="w-full p-2 border rounded bg-white min-h-[100px]"
            placeholder={`ใส่เนื้อหา${BOX_TYPES[type].name}...`}
          />
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            บันทึก
          </button>
        </div>
      ) : (
        <div className="mt-2 whitespace-pre-wrap">
          {currentContent || <span className="text-gray-400">คลิก Edit เพื่อเพิ่มเนื้อหา</span>}
        </div>
      )}

      {currentContent && (
        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <Clock size={12} />
          <span>เวลาในการอ่าน: {formatReadingTime(readingStats.time)} ({readingStats.words} คำ)</span>
        </div>
      )}
    </div>
  );
};

const AddButton = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-2 mb-8 bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600"
      >
        + เพิ่มกล่องข้อความ
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 z-10"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {Object.entries(BOX_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                onAdd(key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:${value.bgColor}`}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Board = () => {
  const [boxes, setBoxes] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const items = Array.from(boxes);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);

    setBoxes(items);
    setDraggedIndex(null);
  };

  const handleDelete = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const handleContentChange = (id, newContent) => {
    setBoxes(boxes.map(box => 
      box.id === id 
        ? { ...box, content: newContent, lastEdited: new Date().toISOString() } 
        : box
    ));
  };

  const addNewBox = (type) => {
    const newBox = {
      id: String(boxes.length + 1),
      content: '',
      type: type,
      lastEdited: null
    };
    setBoxes([...boxes, newBox]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <AddButton onAdd={addNewBox} />
        
        <div className="flex flex-col gap-4 items-start">
          {boxes.map((box, index) => (
            <TextBox
              key={box.id}
              {...box}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={handleDelete}
              onContentChange={handleContentChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
