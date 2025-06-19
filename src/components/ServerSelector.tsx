import React, { useState, useMemo } from 'react';
import Input from '@/components/ui/Input';

// 服务器列表
export const SERVER_LIST = [
  { id: 1, name: "艾欧尼亚" },
  { id: 2, name: "祖安" },
  { id: 3, name: "诺克萨斯" },
  { id: 4, name: "班德尔城" },
  { id: 5, name: "皮尔特沃夫" },
  { id: 6, name: "战争学院" },
  { id: 7, name: "巨神峰" },
  { id: 8, name: "雷瑟守备" },
  { id: 9, name: "裁决之地" },
  { id: 10, name: "黑色玫瑰" },
  { id: 11, name: "暗影岛" },
  { id: 12, name: "钢铁烈阳" },
  { id: 13, name: "水晶之痕" },
  { id: 14, name: "均衡教派" },
  { id: 15, name: "影流" },
  { id: 16, name: "守望之海" },
  { id: 17, name: "征服之海" },
  { id: 18, name: "卡拉曼达" },
  { id: 19, name: "皮城警备" },
  { id: 20, name: "比尔吉沃特" },
  { id: 21, name: "德玛西亚" },
  { id: 22, name: "弗雷尔卓德" },
  { id: 23, name: "无畏先锋" },
  { id: 24, name: "恕瑞玛" },
  { id: 25, name: "扭曲丛林" },
  { id: 26, name: "巨龙之巢" },
  { id: 27, name: "教育网专区" },
  { id: 28, name: "男爵领域" },
  { id: 29, name: "峡谷之巅" },
  { id: 30, name: "体验服" }
];

interface ServerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  emptyOptionText?: string;
  className?: string;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  value,
  onChange,
  required = false,
  label = "服务器",
  placeholder = "搜索服务器...",
  emptyOptionText = "选择服务器",
  className = ""
}) => {
  const [serverFilter, setServerFilter] = useState('');
  
  // 根据筛选条件过滤服务器
  const filteredServers = useMemo(() => {
    if (!serverFilter) return SERVER_LIST;
    return SERVER_LIST.filter(server => 
      server.name.toLowerCase().includes(serverFilter.toLowerCase())
    );
  }, [serverFilter]);

  return (
    <div className={className}>
      <label htmlFor="server" className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        <Input
          placeholder={placeholder}
          value={serverFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFilter(e.target.value)}
          className="mb-1"
        />
        <select
          id="server"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required={required}
        >
          <option value="">{emptyOptionText}</option>
          {filteredServers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 