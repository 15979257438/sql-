import { storage } from './storage';
import { generateId } from '@/utils/id';
import type { User, Product, Conversation, Message, Review, Bargain, Order, Notification } from '@/types';

// ============ Placeholder Image Helpers ============
// picsum.photos provides free CC0 placeholder images
const img = (id: number, w = 400, h = 400) => `https://picsum.photos/id/${id}/${w}/${h}`;

// ============ Mock Users ============
const mockUsers: User[] = [
  {
    id: 'u1', phone: '1', nickname: '小明', avatar: '',
    school: '清华大学', department: '计算机科学与技术系',
    bio: '热爱编程，喜欢数码产品',
    verified: true, rating: 4.8, balance: 100000,
    createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'u2', phone: '2', nickname: '小红', avatar: '',
    school: '清华大学', department: '经济管理学院',
    bio: '美妆爱好者，闲置衣物的搬运工',
    verified: true, rating: 4.5, balance: 50000,
    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'u3', phone: '3', nickname: '小刚', avatar: '',
    school: '清华大学', department: '机械工程系',
    bio: '运动达人，数码控',
    verified: false, rating: 4.2, balance: 30000,
    createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
  },
];

// ============ Mock Products (with real placeholder images) ============
const mockProducts: Product[] = [
  {
    id: 'p1', sellerId: 'u1',
    title: '高等数学（第七版）上册',
    description: '九成新，只有前面几页有笔记，其余完好。考研必备教材。',
    price: 1500, originalPrice: 4500,
    category: 'textbook', condition: 'like_new',
    images: [img(24, 400, 500), img(25, 400, 500)],
    tradeMethod: 'both', location: '紫荆公寓3号楼',
    status: 'published', views: 342, favorites: 12,
    createdAt: '2026-07-10T08:00:00Z', updatedAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'p2', sellerId: 'u1',
    title: 'MacBook Pro 2023 M3 14英寸 8GB+512GB',
    description: '买来用了半年，因为换了M4所以出。外观完美无划痕，电池循环仅50次，箱说全，带发票。',
    price: 850000, originalPrice: 1299900,
    category: 'digital', condition: 'like_new',
    images: [img(1, 400, 400), img(2, 400, 400), img(3, 400, 400)],
    tradeMethod: 'both', location: '紫荆公寓3号楼',
    status: 'published', views: 567, favorites: 28,
    createdAt: '2026-07-09T10:00:00Z', updatedAt: '2026-07-09T10:00:00Z',
  },
  {
    id: 'p3', sellerId: 'u2',
    title: '微积分（同济版）+ 习题全解',
    description: '两本一起出，微积分课本和配套习题全解，适合期末复习。',
    price: 2500, originalPrice: 6800,
    category: 'textbook', condition: 'used',
    images: [img(26, 400, 500), img(27, 400, 500)],
    tradeMethod: 'pickup', location: '紫荆公寓8号楼',
    status: 'published', views: 189, favorites: 5,
    createdAt: '2026-07-11T09:00:00Z', updatedAt: '2026-07-11T09:00:00Z',
  },
  {
    id: 'p4', sellerId: 'u2',
    title: 'ZARA 秋冬羊毛大衣 M码',
    description: '去年冬天买的，穿了两三次，因为买小了所以出。灰色，含羊毛70%，很保暖。',
    price: 18000, originalPrice: 69900,
    category: 'clothing', condition: 'like_new',
    images: [img(30, 400, 500), img(31, 400, 500)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 234, favorites: 15,
    createdAt: '2026-07-08T14:00:00Z', updatedAt: '2026-07-08T14:00:00Z',
  },
  {
    id: 'p5', sellerId: 'u3',
    title: 'iPad Air 5 64GB WiFi 星空色',
    description: '考研上岸了，iPad闲置出售。一直贴膜带壳使用，屏幕完美，送原装充电器和一个保护壳。',
    price: 280000, originalPrice: 479900,
    category: 'digital', condition: 'like_new',
    images: [img(10, 400, 400), img(11, 400, 400), img(12, 400, 400)],
    tradeMethod: 'both', location: '紫荆公寓5号楼',
    status: 'published', views: 891, favorites: 45,
    createdAt: '2026-07-12T16:00:00Z', updatedAt: '2026-07-12T16:00:00Z',
  },
  {
    id: 'p6', sellerId: 'u1',
    title: '线性代数及其应用（David C. Lay）',
    description: '英文影印版，有少量笔记。适合数学系和计算机系。',
    price: 1200, originalPrice: 3500,
    category: 'textbook', condition: 'used',
    images: [img(28, 400, 500), img(29, 400, 500)],
    tradeMethod: 'pickup', location: '紫荆公寓3号楼',
    status: 'published', views: 156, favorites: 3,
    createdAt: '2026-07-13T07:00:00Z', updatedAt: '2026-07-13T07:00:00Z',
  },
  {
    id: 'p7', sellerId: 'u2',
    title: '兰蔻持妆粉底液 PO-01 仅试用',
    description: '色号买错了，仅试用一次。适合白皮妹子，持妆效果确实好。',
    price: 12000, originalPrice: 42000,
    category: 'beauty', condition: 'like_new',
    images: [img(40, 400, 400), img(41, 400, 400)],
    tradeMethod: 'pickup', location: '紫荆公寓8号楼',
    status: 'published', views: 421, favorites: 22,
    createdAt: '2026-07-07T11:00:00Z', updatedAt: '2026-07-07T11:00:00Z',
  },
  {
    id: 'p8', sellerId: 'u3',
    title: '闲置台灯 LED护眼灯 可调光',
    description: '宿舍用了一年，毕业出。三档调光，USB充电，触摸开关。',
    price: 3500, originalPrice: 8900,
    category: 'home', condition: 'used',
    images: [img(50, 400, 400), img(51, 400, 400)],
    tradeMethod: 'pickup', location: '紫荆公寓5号楼',
    status: 'published', views: 203, favorites: 8,
    createdAt: '2026-07-14T08:00:00Z', updatedAt: '2026-07-14T08:00:00Z',
  },
  {
    id: 'p9', sellerId: 'u1',
    title: 'AirPods Pro 2代 USB-C',
    description: '苹果官网购入，用了3个月，因为买了AirPods Max所以出。全套配件齐全，耳机无划痕。',
    price: 120000, originalPrice: 189900,
    category: 'digital', condition: 'like_new',
    images: [img(4, 400, 400), img(5, 400, 400)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 678, favorites: 35,
    createdAt: '2026-07-06T13:00:00Z', updatedAt: '2026-07-06T13:00:00Z',
  },
  {
    id: 'p10', sellerId: 'u2',
    title: '大学英语四级真题+模拟卷（2024版）',
    description: '只做了一套，其余全新。附赠听力光盘和词汇手册。',
    price: 1800, originalPrice: 4500,
    category: 'textbook', condition: 'like_new',
    images: [img(32, 400, 500), img(33, 400, 500)],
    tradeMethod: 'pickup', location: '紫荆公寓8号楼',
    status: 'published', views: 145, favorites: 2,
    createdAt: '2026-07-13T15:00:00Z', updatedAt: '2026-07-13T15:00:00Z',
  },
  {
    id: 'p11', sellerId: 'u3',
    title: '尤尼克斯羽毛球拍 NR-750',
    description: '球拍买了一年，使用频率不高。手感很好，适合进阶球友。送一个拍套。',
    price: 15000, originalPrice: 35900,
    category: 'sports', condition: 'used',
    images: [img(60, 400, 400), img(61, 400, 400)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 298, favorites: 14,
    createdAt: '2026-07-05T10:00:00Z', updatedAt: '2026-07-05T10:00:00Z',
  },
  {
    id: 'p12', sellerId: 'u1',
    title: '人体工程学椅 西昊M18',
    description: '宿舍自用，腰部支撑很好。毕业出，需要自提，不提供送货。',
    price: 35000, originalPrice: 89900,
    category: 'home', condition: 'used',
    images: [img(52, 400, 400), img(53, 400, 400)],
    tradeMethod: 'pickup', location: '紫荆公寓3号楼302',
    status: 'published', views: 412, favorites: 19,
    createdAt: '2026-07-04T09:00:00Z', updatedAt: '2026-07-04T09:00:00Z',
  },
  {
    id: 'p13', sellerId: 'u2',
    title: 'UNIQLO 摇粒绒外套 女款 L码',
    description: '挺暖和的，穿了半个冬天，没起球。米白色，很好搭配。',
    price: 5000, originalPrice: 19900,
    category: 'clothing', condition: 'used',
    images: [img(34, 400, 500), img(35, 400, 500)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 356, favorites: 17,
    createdAt: '2026-07-03T12:00:00Z', updatedAt: '2026-07-03T12:00:00Z',
  },
  {
    id: 'p14', sellerId: 'u3',
    title: '数据结构（C语言版）严蔚敏',
    description: '计算机考研408必备，书角有点卷但内页完好，笔记很全。',
    price: 1000, originalPrice: 3500,
    category: 'textbook', condition: 'used',
    images: [img(36, 400, 500), img(37, 400, 500)],
    tradeMethod: 'pickup', location: '紫荆公寓5号楼',
    status: 'published', views: 523, favorites: 31,
    createdAt: '2026-07-02T08:00:00Z', updatedAt: '2026-07-02T08:00:00Z',
  },
  {
    id: 'p15', sellerId: 'u1',
    title: 'SK-II 神仙水 230ml 全新未拆',
    description: '朋友送的礼物，自己不用这个牌子。专柜正品，保质期到2027年。',
    price: 35000, originalPrice: 79800,
    category: 'beauty', condition: 'new',
    images: [img(42, 400, 400), img(43, 400, 400)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 712, favorites: 40,
    createdAt: '2026-07-01T14:00:00Z', updatedAt: '2026-07-01T14:00:00Z',
  },
  {
    id: 'p16', sellerId: 'u2',
    title: '瑜伽垫 加厚10mm NBR材质',
    description: '只用了两个月，后来办了健身房卡就不用了。已清洁消毒。',
    price: 2000, originalPrice: 5900,
    category: 'sports', condition: 'used',
    images: [img(62, 400, 400), img(63, 400, 400)],
    tradeMethod: 'pickup', location: '紫荆公寓8号楼',
    status: 'published', views: 89, favorites: 3,
    createdAt: '2026-07-14T10:00:00Z', updatedAt: '2026-07-14T10:00:00Z',
  },
  {
    id: 'p17', sellerId: 'u3',
    title: '罗技 MX Master 3S 无线鼠标',
    description: '去年618买的，因为换了Magic Mouse所以出。手感无敌，适合大手。',
    price: 28000, originalPrice: 69900,
    category: 'digital', condition: 'used',
    images: [img(6, 400, 400), img(7, 400, 400)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 445, favorites: 21,
    createdAt: '2026-07-11T17:00:00Z', updatedAt: '2026-07-11T17:00:00Z',
  },
  {
    id: 'p18', sellerId: 'u1',
    title: '床上小桌子 可折叠 带抽屉',
    description: '宿舍床上学习桌，可折叠不占地方。桌面有贴纸，不影响使用。',
    price: 2500, originalPrice: 6500,
    category: 'home', condition: 'used',
    images: [img(54, 400, 400), img(55, 400, 400)],
    tradeMethod: 'pickup', location: '紫荆公寓3号楼',
    status: 'published', views: 178, favorites: 6,
    createdAt: '2026-07-12T08:00:00Z', updatedAt: '2026-07-12T08:00:00Z',
  },
  {
    id: 'p19', sellerId: 'u2',
    title: 'Kindle Paperwhite 5 8GB',
    description: '吃灰神器，几乎全新。买了半年看了两本书。。。送保护壳。',
    price: 60000, originalPrice: 106800,
    category: 'digital', condition: 'like_new',
    images: [img(8, 400, 400), img(9, 400, 400)],
    tradeMethod: 'both', location: '',
    status: 'published', views: 534, favorites: 33,
    createdAt: '2026-07-08T09:00:00Z', updatedAt: '2026-07-08T09:00:00Z',
  },
  {
    id: 'p20', sellerId: 'u3',
    title: '中国共产党简史（考研政治用）',
    description: '考研政治必备，重点部分有标注。',
    price: 800, originalPrice: 2600,
    category: 'textbook', condition: 'used',
    images: [img(38, 400, 500), img(39, 400, 500)],
    tradeMethod: 'pickup', location: '紫荆公寓5号楼',
    status: 'published', views: 267, favorites: 8,
    createdAt: '2026-07-10T11:00:00Z', updatedAt: '2026-07-10T11:00:00Z',
  },
];

// ============ Hardcoded Reviews ============
const mockReviews: Review[] = [
  {
    id: 'r1', orderId: 'o1', productId: 'p2', reviewerId: 'u2',
    targetId: 'u1', rating: 5, comment: 'MacBook成色非常好，几乎全新，电池循环次数确实很少，卖家很靠谱！',
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'r2', orderId: 'o2', productId: 'p5', reviewerId: 'u1',
    targetId: 'u3', rating: 4, comment: 'iPad整体不错，屏幕完美，送了充电器和壳，性价比很高。',
    createdAt: '2026-07-14T14:00:00Z',
  },
  {
    id: 'r3', orderId: 'o3', productId: 'p9', reviewerId: 'u3',
    targetId: 'u1', rating: 5, comment: 'AirPods Pro 音质很棒，降噪效果一流，配件齐全，包装完好。',
    createdAt: '2026-07-13T09:00:00Z',
  },
  {
    id: 'r4', orderId: 'o4', productId: 'p4', reviewerId: 'u1',
    targetId: 'u2', rating: 4, comment: '大衣质量很好，含羊毛70%确实保暖，灰色很百搭，尺码也合适。',
    createdAt: '2026-07-12T16:00:00Z',
  },
  {
    id: 'r5', orderId: 'o5', productId: 'p19', reviewerId: 'u2',
    targetId: 'u3', rating: 5, comment: 'Kindle几乎全新，送了保护壳，看电子书体验很好，推荐！',
    createdAt: '2026-07-11T11:00:00Z',
  },
  {
    id: 'r6', orderId: 'o6', productId: 'p17', reviewerId: 'u1',
    targetId: 'u3', rating: 5, comment: 'MX Master 3S手感无敌，适合大手，编程利器，卖家发货很快。',
    createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'r7', orderId: 'o7', productId: 'p1', reviewerId: 'u3',
    targetId: 'u1', rating: 4, comment: '高数教材笔记很全，重点标注清晰，考研必备，价格实惠。',
    createdAt: '2026-07-09T15:00:00Z',
  },
  {
    id: 'r8', orderId: 'o8', productId: 'p15', reviewerId: 'u1',
    targetId: 'u2', rating: 5, comment: 'SK-II神仙水全新未拆，保质期到2027年，朋友送的礼物转手很划算。',
    createdAt: '2026-07-08T12:00:00Z',
  },
];

// ============ Hardcoded Conversations ============
const mockConversations: Conversation[] = [
  {
    id: 'conv1', productId: 'p2', buyerId: 'u2', sellerId: 'u1',
    lastMessage: '好的，那我们明天下午在图书馆门口见？',
    lastMessageAt: '2026-07-16T14:30:00Z',
    unreadBuyer: 0, unreadSeller: 2,
    product: mockProducts.find(p => p.id === 'p2'),
    buyer: mockUsers.find(u => u.id === 'u2'),
    seller: mockUsers.find(u => u.id === 'u1'),
    createdAt: '2026-07-14T10:00:00Z', updatedAt: '2026-07-16T14:30:00Z',
  },
  {
    id: 'conv2', productId: 'p5', buyerId: 'u1', sellerId: 'u3',
    lastMessage: 'iPad还在吗？可以便宜点吗？',
    lastMessageAt: '2026-07-16T11:00:00Z',
    unreadBuyer: 1, unreadSeller: 0,
    product: mockProducts.find(p => p.id === 'p5'),
    buyer: mockUsers.find(u => u.id === 'u1'),
    seller: mockUsers.find(u => u.id === 'u3'),
    createdAt: '2026-07-15T09:00:00Z', updatedAt: '2026-07-16T11:00:00Z',
  },
  {
    id: 'conv3', productId: 'p9', buyerId: 'u3', sellerId: 'u1',
    lastMessage: '[图片]',
    lastMessageAt: '2026-07-15T20:00:00Z',
    unreadBuyer: 0, unreadSeller: 0,
    product: mockProducts.find(p => p.id === 'p9'),
    buyer: mockUsers.find(u => u.id === 'u3'),
    seller: mockUsers.find(u => u.id === 'u1'),
    createdAt: '2026-07-13T08:00:00Z', updatedAt: '2026-07-15T20:00:00Z',
  },
  {
    id: 'conv4', productId: 'p4', buyerId: 'u1', sellerId: 'u2',
    lastMessage: '大衣可以试穿吗？我在学校附近',
    lastMessageAt: '2026-07-15T16:00:00Z',
    unreadBuyer: 0, unreadSeller: 1,
    product: mockProducts.find(p => p.id === 'p4'),
    buyer: mockUsers.find(u => u.id === 'u1'),
    seller: mockUsers.find(u => u.id === 'u2'),
    createdAt: '2026-07-12T14:00:00Z', updatedAt: '2026-07-15T16:00:00Z',
  },
];

// ============ Hardcoded Messages ============
const mockMessages: Record<string, Message[]> = {
  conv1: [
    { id: 'm1', conversationId: 'conv1', senderId: 'u2', type: 'text', content: '你好，MacBook Pro还在吗？', read: true, createdAt: '2026-07-14T10:00:00Z' },
    { id: 'm2', conversationId: 'conv1', senderId: 'u1', type: 'text', content: '在的！M3芯片，8GB+512GB，用了半年，成色很好', read: true, createdAt: '2026-07-14T10:05:00Z' },
    { id: 'm3', conversationId: 'conv1', senderId: 'u2', type: 'text', content: '电池循环次数多少？有发票吗？', read: true, createdAt: '2026-07-14T10:06:00Z' },
    { id: 'm4', conversationId: 'conv1', senderId: 'u1', type: 'text', content: '循环50次，箱说全，带发票，可以当面验机', read: true, createdAt: '2026-07-14T10:10:00Z' },
    { id: 'm5', conversationId: 'conv1', senderId: 'u2', type: 'text', content: '价格能再优惠一点吗？8500有点超预算了', read: true, createdAt: '2026-07-14T10:15:00Z' },
    { id: 'm6', conversationId: 'conv1', senderId: 'u1', type: 'text', content: '最低8200，已经是底价了，这个配置很值的', read: true, createdAt: '2026-07-14T10:20:00Z' },
    { id: 'm7', conversationId: 'conv1', senderId: 'u2', type: 'text', content: '好的，那我们明天下午在图书馆门口见？', read: true, createdAt: '2026-07-16T14:30:00Z' },
  ],
  conv2: [
    { id: 'm8', conversationId: 'conv2', senderId: 'u1', type: 'text', content: 'iPad Air 5还在吗？', read: true, createdAt: '2026-07-15T09:00:00Z' },
    { id: 'm9', conversationId: 'conv2', senderId: 'u3', type: 'text', content: '在的，星空色64GB，一直贴膜带壳用', read: true, createdAt: '2026-07-15T09:05:00Z' },
    { id: 'm10', conversationId: 'conv2', senderId: 'u1', type: 'text', content: 'iPad还在吗？可以便宜点吗？', read: false, createdAt: '2026-07-16T11:00:00Z' },
  ],
  conv3: [
    { id: 'm11', conversationId: 'conv3', senderId: 'u3', type: 'text', content: 'AirPods Pro 2代还有吗？', read: true, createdAt: '2026-07-13T08:00:00Z' },
    { id: 'm12', conversationId: 'conv3', senderId: 'u1', type: 'text', content: '有的，USB-C版本，用了3个月', read: true, createdAt: '2026-07-13T08:05:00Z' },
    { id: 'm13', conversationId: 'conv3', senderId: 'u3', type: 'text', content: '降噪效果怎么样？', read: true, createdAt: '2026-07-13T08:10:00Z' },
    { id: 'm14', conversationId: 'conv3', senderId: 'u1', type: 'text', content: '降噪一流，通透模式也很自然，全套配件都在', read: true, createdAt: '2026-07-13T08:15:00Z' },
    { id: 'm15', conversationId: 'conv3', senderId: 'u1', type: 'image', content: '[图片]', imageUrl: 'https://picsum.photos/id/4/400/400', read: true, createdAt: '2026-07-15T20:00:00Z' },
  ],
  conv4: [
    { id: 'm16', conversationId: 'conv4', senderId: 'u1', type: 'text', content: 'ZARA大衣M码还有吗？', read: true, createdAt: '2026-07-12T14:00:00Z' },
    { id: 'm17', conversationId: 'conv4', senderId: 'u2', type: 'text', content: '有的，灰色，含羊毛70%，很保暖', read: true, createdAt: '2026-07-12T14:05:00Z' },
    { id: 'm18', conversationId: 'conv4', senderId: 'u1', type: 'text', content: '大衣可以试穿吗？我在学校附近', read: false, createdAt: '2026-07-15T16:00:00Z' },
  ],
};

// ============ Hardcoded Orders ============
const mockOrders: Order[] = [
  {
    id: 'o1', productId: 'p2', buyerId: 'u2', sellerId: 'u1',
    status: 'completed', price: 820000, message: 'MacBook Pro M3',
    createdAt: '2026-07-14T10:30:00Z', updatedAt: '2026-07-15T10:00:00Z',
    paidAt: '2026-07-14T10:35:00Z', payMethod: 'balance',
  },
  {
    id: 'o2', productId: 'p5', buyerId: 'u1', sellerId: 'u3',
    status: 'completed', price: 260000, message: 'iPad Air 5',
    createdAt: '2026-07-13T09:00:00Z', updatedAt: '2026-07-14T14:00:00Z',
    paidAt: '2026-07-13T09:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o3', productId: 'p9', buyerId: 'u3', sellerId: 'u1',
    status: 'completed', price: 115000, message: 'AirPods Pro 2',
    createdAt: '2026-07-12T08:00:00Z', updatedAt: '2026-07-13T09:00:00Z',
    paidAt: '2026-07-12T08:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o4', productId: 'p4', buyerId: 'u1', sellerId: 'u2',
    status: 'shipped', price: 17000, message: 'ZARA大衣',
    createdAt: '2026-07-11T14:00:00Z', updatedAt: '2026-07-12T16:00:00Z',
    paidAt: '2026-07-11T14:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o5', productId: 'p19', buyerId: 'u2', sellerId: 'u3',
    status: 'completed', price: 58000, message: 'Kindle PW5',
    createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-11T11:00:00Z',
    paidAt: '2026-07-10T09:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o6', productId: 'p17', buyerId: 'u1', sellerId: 'u3',
    status: 'completed', price: 27000, message: 'MX Master 3S',
    createdAt: '2026-07-09T08:00:00Z', updatedAt: '2026-07-10T08:00:00Z',
    paidAt: '2026-07-09T08:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o7', productId: 'p1', buyerId: 'u3', sellerId: 'u1',
    status: 'completed', price: 1400, message: '高数教材',
    createdAt: '2026-07-08T15:00:00Z', updatedAt: '2026-07-09T15:00:00Z',
    paidAt: '2026-07-08T15:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o8', productId: 'p15', buyerId: 'u1', sellerId: 'u2',
    status: 'completed', price: 33000, message: 'SK-II神仙水',
    createdAt: '2026-07-07T12:00:00Z', updatedAt: '2026-07-08T12:00:00Z',
    paidAt: '2026-07-07T12:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o9', productId: 'p3', buyerId: 'u1', sellerId: 'u2',
    status: 'accepted', price: 2300, message: '微积分教材',
    createdAt: '2026-07-16T09:00:00Z', updatedAt: '2026-07-16T10:00:00Z',
    paidAt: '2026-07-16T09:05:00Z', payMethod: 'balance',
  },
  {
    id: 'o10', productId: 'p11', buyerId: 'u2', sellerId: 'u3',
    status: 'pending', price: 14000, message: '羽毛球拍',
    createdAt: '2026-07-16T15:00:00Z', updatedAt: '2026-07-16T15:00:00Z',
  },
];

// ============ Hardcoded Bargains ============
const mockBargains: Bargain[] = [
  {
    id: 'bg1', productId: 'p2', buyerId: 'u2', sellerId: 'u1',
    originalPrice: 850000, currentPrice: 820000, targetPrice: 800000,
    status: 'accepted',
    offers: [
      { userId: 'u2', price: 800000, message: '能再便宜点吗？', createdAt: '2026-07-14T10:10:00Z' },
      { userId: 'u1', price: 820000, message: '最低8200了', createdAt: '2026-07-14T10:20:00Z' },
      { userId: 'u2', price: 820000, message: '好的，成交！', createdAt: '2026-07-14T10:25:00Z' },
    ],
    product: mockProducts.find(p => p.id === 'p2'),
    buyer: mockUsers.find(u => u.id === 'u2'),
    seller: mockUsers.find(u => u.id === 'u1'),
    createdAt: '2026-07-14T10:10:00Z', updatedAt: '2026-07-14T10:25:00Z',
  },
  {
    id: 'bg2', productId: 'p5', buyerId: 'u1', sellerId: 'u3',
    originalPrice: 280000, currentPrice: 260000, targetPrice: 250000,
    status: 'pending',
    offers: [
      { userId: 'u1', price: 250000, message: '能便宜点吗？', createdAt: '2026-07-15T09:10:00Z' },
      { userId: 'u3', price: 260000, message: '最低2600', createdAt: '2026-07-15T09:20:00Z' },
    ],
    product: mockProducts.find(p => p.id === 'p5'),
    buyer: mockUsers.find(u => u.id === 'u1'),
    seller: mockUsers.find(u => u.id === 'u3'),
    createdAt: '2026-07-15T09:10:00Z', updatedAt: '2026-07-15T09:20:00Z',
  },
  {
    id: 'bg3', productId: 'p9', buyerId: 'u3', sellerId: 'u1',
    originalPrice: 120000, currentPrice: 115000, targetPrice: 110000,
    status: 'accepted',
    offers: [
      { userId: 'u3', price: 110000, message: '1100行吗？', createdAt: '2026-07-13T08:20:00Z' },
      { userId: 'u1', price: 115000, message: '1150最低了', createdAt: '2026-07-13T08:30:00Z' },
      { userId: 'u3', price: 115000, message: '好的', createdAt: '2026-07-13T08:35:00Z' },
    ],
    product: mockProducts.find(p => p.id === 'p9'),
    buyer: mockUsers.find(u => u.id === 'u3'),
    seller: mockUsers.find(u => u.id === 'u1'),
    createdAt: '2026-07-13T08:20:00Z', updatedAt: '2026-07-13T08:35:00Z',
  },
];

// ============ Hardcoded Notifications ============
const mockNotifications: Notification[] = [
  {
    id: 'n1', userId: 'u1', type: 'order', title: '买家已下单',
    body: '您的商品「MacBook Pro 2023 M3」已被下单，请尽快处理',
    relatedId: 'o1', productId: 'p2', productTitle: 'MacBook Pro 2023 M3 14英寸',
    price: 820000, orderStatus: 'accepted', read: true,
    createdAt: '2026-07-14T10:30:00Z',
  },
  {
    id: 'n2', userId: 'u2', type: 'order', title: '卖家已发货',
    body: '您的订单「MacBook Pro 2023 M3」已发货，请留意收货',
    relatedId: 'o1', productId: 'p2', productTitle: 'MacBook Pro 2023 M3 14英寸',
    price: 820000, orderStatus: 'shipped', read: true,
    createdAt: '2026-07-14T14:00:00Z',
  },
  {
    id: 'n3', userId: 'u1', type: 'order', title: '买家已确认收货',
    body: '订单「MacBook Pro 2023 M3」交易完成，款项已到账',
    relatedId: 'o1', productId: 'p2', productTitle: 'MacBook Pro 2023 M3 14英寸',
    price: 820000, orderStatus: 'completed', read: false,
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'n4', userId: 'u1', type: 'message', title: '新的砍价',
    body: '小明对您的商品「iPad Air 5」发起砍价：¥2500',
    relatedId: 'bg2', productId: 'p5', productTitle: 'iPad Air 5 64GB WiFi',
    price: 250000, read: false,
    createdAt: '2026-07-15T09:10:00Z',
  },
  {
    id: 'n5', userId: 'u3', type: 'order', title: '买家已下单',
    body: '您的商品「AirPods Pro 2代」已被下单',
    relatedId: 'o3', productId: 'p9', productTitle: 'AirPods Pro 2代 USB-C',
    price: 115000, orderStatus: 'accepted', read: true,
    createdAt: '2026-07-12T08:00:00Z',
  },
];

// ============ Hardcoded Addresses ============
const mockAddresses = [
  {
    id: 'addr1', userId: 'u1', name: '小明', phone: '13800138001',
    province: '北京市', city: '北京市', district: '海淀区',
    detail: '清华大学紫荆公寓3号楼302室', isDefault: true,
  },
  {
    id: 'addr2', userId: 'u1', name: '小明（家）', phone: '13800138001',
    province: '北京市', city: '北京市', district: '朝阳区',
    detail: '望京SOHO T1 15层', isDefault: false,
  },
];

// ============ Seed function ============
export function seedIfEmpty(): void {
  const existingProducts = storage.get<Product[]>('products');
  if (existingProducts && existingProducts.length > 0) return;

  storage.set('users', mockUsers);
  storage.set('products', mockProducts);
  storage.set('conversations', mockConversations);
  storage.set('orders', mockOrders);
  storage.set('notifications', mockNotifications);
  storage.set('reviews', mockReviews);
  storage.set('bargains', mockBargains);
  storage.set('addresses', mockAddresses);
  storage.set('uploadedImages', {});
  storage.set('searchHistory', [] as string[]);
  storage.set('favorites', {} as Record<string, string[]>);
  storage.set('history', [] as string[]);

  // Seed messages for each conversation
  Object.entries(mockMessages).forEach(([convId, msgs]) => {
    storage.set(`messages_${convId}`, msgs);
  });
}

/** Reset all data and reseed */
export function resetData(): void {
  storage.set('users', mockUsers);
  storage.set('products', mockProducts);
  storage.set('conversations', mockConversations);
  storage.set('orders', mockOrders);
  storage.set('notifications', mockNotifications);
  storage.set('reviews', mockReviews);
  storage.set('bargains', mockBargains);
  storage.set('addresses', mockAddresses);
  storage.set('uploadedImages', {});
  storage.set('searchHistory', [] as string[]);
  storage.set('favorites', {} as Record<string, string[]>);
  storage.set('history', [] as string[]);
  storage.remove('currentUser');

  Object.entries(mockMessages).forEach(([convId, msgs]) => {
    storage.set(`messages_${convId}`, msgs);
  });
}

/** Get all users */
export function getUsers(): User[] {
  return storage.get<User[]>('users') || [];
}

/** Get user by ID */
export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.id === id);
}

/** Get user by phone */
export function getUserByPhone(phone: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.phone === phone);
}
