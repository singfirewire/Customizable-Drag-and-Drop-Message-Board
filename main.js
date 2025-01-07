import React, { useState, useMemo } from 'react';
import { X, Edit2, ChevronDown, Clock } from 'lucide-react';

const BOX_TYPES = {
  heading: { name: 'หัวข้อ', bgColor: 'bg-white' },
  narrative: { name: 'บทบรรยาย', bgColor: 'bg-blue-50' },
  interview: { name: 'สัมภาษณ์', bgColor: 'bg-green-50' },
  command: { name: 'คำสั่งพิเศษ', bgColor: 'bg-yellow-50' },
  comment: { name: 'ความเห็น', bgColor: 'bg-purple-50' }
};

const calculateReadingTime = (content) => {
  if (!content) return { words: 0, time: 0 };
  const wordCount = content.trim().split(/\s+/).length;
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
