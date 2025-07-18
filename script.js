document.addEventListener('DOMContentLoaded', () => {
    const categoryNav = document.getElementById('category-nav');
    const menuContainer = document.getElementById('menu-container');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const itemDetailModal = document.getElementById('item-detail-modal');
    const itemDetailClose = document.getElementById('item-detail-close');
    const itemDetailBody = document.getElementById('item-detail-body');
    const langSwitcher = document.getElementById('lang-switcher');

    // Chatbot functionality
    const chatButton = document.getElementById('chat-button');
    const chatSendButton = document.getElementById('chat-send-button');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatNotification = document.getElementById('chat-notification');

    // Toast notification system
    const toastContainer = document.getElementById('toast-container');
    let toastQueue = [];
    let isShowingToast = false;
    let lastToastTime = 0;
    const TOAST_COOLDOWN = 2000; // Minimum time between toasts (2 seconds)

    // Party size tracking variables - moved to top for proper initialization
    let hasAskedPartySize = false;
    let partySizeAsked = false;
    let selectedPartySize = null;
    let isPartyWarningActive = false;
    let hasShownLargePartyWarning = false;
    
    let isChatOpen = false;
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    let ollamaConnected = false; // Biến theo dõi trạng thái kết nối Ollama

    // Sử dụng cấu hình từ file ollama-config.js
    // Nếu không có file config, sử dụng cấu hình mặc định
    const OLLAMA_CONFIG = window.OLLAMA_CONFIG || {
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen2.5:0.5b',
        timeout: 30000,
        maxTokens: 300,
        options: {
            temperature: 0.8,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            num_ctx: 2048,
            num_predict: 300
        }
    };

    const SYSTEM_PROMPT = window.SYSTEM_PROMPT || `Bạn là trợ lý AI thân thiện cho nhà hàng hải sản. 

Nhiệm vụ của bạn:
- Trả lời về menu, giá cả, giờ mở cửa
- Tư vấn về các món hải sản tươi ngon
- Hỗ trợ khách hàng đặt món
- Trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người dùng
- Giữ câu trả lời ngắn gọn, thân thiện và hữu ích

Thông tin nhà hàng:
- Chuyên về hải sản tươi: tôm hùm, cua, ghẹ, cá, mực
- Giờ mở cửa: 10:00 AM - 10:00 PM, 7 ngày/tuần
- Có thể đặt món trực tiếp qua menu này

Hãy trả lời một cách tự nhiên và hữu ích!`;

    // Chatbot knowledge base
    const chatbotKnowledge = {
        greetings: {
            patterns: ['xin chào', 'hello', 'hi', 'chào', 'hey'],
            responses: [
                'Xin chào! Tôi có thể giúp gì cho bạn?',
                'Chào bạn! Bạn cần tư vấn gì về menu không?',
                'Hello! How can I help you today?'
            ]
        },
        menu: {
            patterns: ['menu', 'thực đơn', 'món ăn', 'food', 'dishes'],
            responses: [
                'Chúng tôi có nhiều món hải sản tươi ngon! Bạn có thể xem menu ở trên. Có món nào bạn quan tâm không?',
                'Menu của chúng tôi gồm các món hải sản đặc trưng. Bạn thích món gì?',
                'Our menu features fresh seafood dishes. What would you like to know about?'
            ]
        },
        prices: {
            patterns: ['giá', 'price', 'cost', 'bao nhiêu', 'how much'],
            responses: [
                'Giá cả phụ thuộc vào món và khối lượng. Bạn có thể xem giá chi tiết trong menu.',
                'Prices vary by dish and weight. Check the menu for detailed pricing.',
                'Bạn có thể chọn món và tôi sẽ cho biết giá cụ thể.'
            ]
        },
        hours: {
            patterns: ['giờ', 'hours', 'mở cửa', 'open', 'đóng cửa', 'close'],
            responses: [
                'Chúng tôi mở cửa từ 10:00 AM đến 10:00 PM, 7 ngày/tuần.',
                'We are open from 10:00 AM to 10:00 PM, 7 days a week.',
                'Giờ mở cửa: 10:00 - 22:00 hàng ngày.'
            ]
        },
        location: {
            patterns: ['địa chỉ', 'address', 'location', 'ở đâu', 'where'],
            responses: [
                'Chúng tôi tọa lạc tại trung tâm thành phố. Bạn có muốn biết địa chỉ cụ thể không?',
                'We are located in the city center. Would you like the specific address?',
                'Địa chỉ: [Cập nhật địa chỉ thực tế của nhà hàng]'
            ]
        },
        order: {
            patterns: ['đặt món', 'order', 'đặt hàng', 'book', 'reservation'],
            responses: [
                'Bạn có thể đặt món trực tiếp qua menu này. Chọn món và thêm vào giỏ hàng!',
                'You can order directly through this menu. Select items and add to cart!',
                'Để đặt món, hãy chọn món ăn và thêm vào giỏ hàng.'
            ]
        },
        seafood: {
            patterns: ['hải sản', 'seafood', 'tôm', 'cua', 'cá', 'mực'],
            responses: [
                'Chúng tôi chuyên về hải sản tươi ngon! Có tôm hùm, cua, cá, mực và nhiều món khác.',
                'We specialize in fresh seafood! Lobster, crab, fish, squid and more.',
                'Hải sản của chúng tôi được chọn lọc kỹ và chế biến theo công thức đặc biệt.'
            ]
        }
    };

    // Quick action buttons - sẽ được cập nhật động theo ngôn ngữ
    let quickActions = [
        { text: 'Xem menu', action: 'menu' },
        { text: 'Giờ mở cửa', action: 'hours' },
        { text: 'Đặt món', action: 'order' },
        { text: 'Giá cả', action: 'prices' }
    ];

    // Special seafood items that need special notification - grouped by type
    const specialSeafoodGroups = {
        'lobster': {
            name: 'Tôm hùm',
            items: [
                'tri_hang_special_lobster', // Tôm hùm đặc biệt Tri Hàng - 1.600.000đ/kg
                'grilled_lobster_cheese', // Tôm hùm nướng phô mai - 1.600.000đ/kg
                'garlic_butter_lobster', // Tôm hùm sốt bơ tỏi - 1.600.000đ/kg
                'steamed_lobster', // Tôm hùm hấp - 1.600.000đ/kg
                'grilled_lobster' // Tôm hùm nướng mọi - 1.600.000đ/kg
            ],
            pricePerKg: 1600000
        },
        'blue_crab': {
            name: 'Ghẹ',
            items: [
                'steamed_blue_crab', // Ghẹ hấp - 600.000đ/kg
                'blue_crab_tamarind_sauce' // Ghẹ sốt me - 600.000đ/kg
            ],
            pricePerKg: 600000
        },
        'sea_crab': {
            name: 'Cua biển',
            items: [
                'steamed_sea_crab', // Cua biển hấp - 800.000đ/kg
                'sea_crab_tamarind_sauce' // Cua biển sốt me - 800.000đ/kg
            ],
            pricePerKg: 800000
        },
        'fish': {
            name: 'Cá',
            items: [
                'grilled_blue_bone_throbbing_fish', // Cá chai nướng - 800.000đ/kg
                'grilled_lime_key_fish', // Cá chìa vôi nướng - 700.000đ/kg
                'grilled_betel_nut_fish', // Cá bả trầu nướng - 750.000đ/kg
                'fish_hotpot_ca_do', // Lẩu cá dò - 200.000đ/kg
                'fish_hotpot_ca_dia' // Lẩu cá dìa - 450.000đ/kg
            ],
            pricePerKg: 800000 // Sử dụng giá cao nhất trong nhóm
        }
    };

    // Track which special notification types have been shown (per session only, not persistent)
    let shownSpecialNotifications = {};
    

    
    // Debug: Log initial state
    console.log('Initial party size variables:', {
        hasAskedPartySize,
        partySizeAsked,
        selectedPartySize,
        hasShownLargePartyWarning
    });

    // Khởi tạo giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartItemCount = cart.length; // Khai báo cartItemCount ngay sau cart
    
    // Cart sẽ được render sau khi translations load để đảm bảo ngôn ngữ đúng
    
    // Khởi tạo ngôn ngữ hiện tại - mặc định là tiếng Anh
    let currentLang = localStorage.getItem('currentLang') || 'en';
    
    // Đảm bảo currentLang được lưu vào localStorage nếu chưa có
    if (!localStorage.getItem('currentLang')) {
        localStorage.setItem('currentLang', 'en');
    }
    
    // Biến lưu trữ bản dịch
    let translations = {};
    
    // Biến để theo dõi chỉ mục đang xem
    let currentCategoryIndex = 0;
    let isScrolling = false;
    let wasClicked = false;
    
    // Price quote modal elements
    const priceQuoteModal = document.getElementById('price-quote-modal');
    const priceQuoteClose = document.getElementById('price-quote-close');
    const gramInput = document.getElementById('gramInput');
    const quotePriceBtn = document.getElementById('quote-price-btn');
    const updateWeightBtn = document.getElementById('update-weight-btn');
    const priceQuoteTitle = document.getElementById('price-quote-title');
    
    // Current item for price quote
    let currentQuoteItem = null;
    let currentQuoteCartIndex = -1;
    
    // Variables for tracking user interaction and party size

    
    // Hàm load bản dịch
    async function loadTranslations() {
        try {
            console.log('Loading translations...');
            const response = await fetch('translations.json');
            console.log('Fetch response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            translations = await response.json();
            console.log('Translations loaded successfully:', Object.keys(translations).length, 'keys');
            console.log('Party warning keys available:', {
                title: translations?.bot_responses?.party_warning_title,
                subtitle: translations?.bot_responses?.party_warning_subtitle,
                message: translations?.bot_responses?.party_warning_message,
                continue: translations?.bot_responses?.party_warning_continue
            });
            // console.log('Translations loaded:', translations);
            // console.log('Items translations:', translations.items);
            // Sau khi load xong translations, cập nhật hiển thị ngôn ngữ
            // Đảm bảo DOM đã sẵn sàng
            setTimeout(() => {
                updateLanguageDisplay(currentLang);
                updateWelcomeMessage();
                updateQuickActions();
                
                // Render cart sau khi translations đã sẵn sàng
                if (cart.length > 0) {
                    renderCartItems();
                    updateCartDisplay(false);
                }
                
                // Khởi tạo phiên chat mới
                initializeChatSession();
            }, 100);
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }
    
    // Hàm lấy bản dịch
    function getTranslation(key, lang = null) {
        const targetLang = lang || currentLang;
        return translations[key]?.[targetLang] || translations[key]?.['en'] || key;
    }
    
    // Hàm lấy bản dịch cho đề mục
    function getCategoryTranslation(categoryName) {
        // Tạo key từ tên đề mục (chuyển thành lowercase và thay thế khoảng trắng bằng underscore)
        const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_');
        return translations.categories?.[categoryKey]?.[currentLang] || 
               translations.categories?.[categoryKey]?.['en'] || 
               categoryName;
    }
    
    // Hàm lấy flag
    function getFlag(lang) {
        const flags = {
            en: '🇺🇸',
            vi: '🇻🇳',
            th: '🇹🇭',
            zh: '🇨🇳',
            ko: '🇰🇷',
            ja: '🇯🇵',
            ru: '🇷🇺'
        };
        return flags[lang] || flags['en'];
    }
    
    // Hàm lấy tên ngôn ngữ
    function getLangName(lang) {
        const names = {
            en: 'English',
            vi: 'Tiếng Việt',
            th: 'ไทย',
            zh: '中文',
            ko: '한국어',
            ja: '日本語',
            ru: 'Русский'
        };
        return names[lang] || names['en'];
    }
    
    // Hàm cập nhật text trong giỏ hàng
    function updateCartTexts() {
        const cartText = document.querySelector('.cart-text');
        if (cartText) {
            cartText.textContent = getTranslation('cart');
        }
        
        if (deleteAllBtn) {
            deleteAllBtn.textContent = getTranslation('delete_all');
        }
        
        // Cập nhật title của cart button
        if (cartButton) {
            cartButton.title = getTranslation('cart');
        }
    }
    
    // Hàm cập nhật hiển thị ngôn ngữ
    function updateLanguageDisplay(lang) {
        const langButton = document.querySelector('.lang-button');
        
        if (langButton) {
            const flag = langButton.querySelector('.flag');
            const text = langButton.querySelector('.lang-text');
            
            if (flag) {
                flag.textContent = getFlag(lang);
            }
            if (text) {
                text.textContent = getLangName(lang);
            }
        }
        updateCartTexts();
        
        // Hủy tất cả toast đang hiển thị
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = '';
        }
        
        // Reset biến giới hạn số lần nhắc nhở
        shownSpecialNotifications = {};
        
        // Reset party size tracking khi chuyển ngôn ngữ
        hasAskedPartySize = false;
        partySizeAsked = false;
        selectedPartySize = null;
        
        // Reset notification badge về 0 khi chuyển ngôn ngữ
        if (chatNotification) {
            chatNotification.style.display = 'none';
        }
        
        // Reset phiên chat mới với ngôn ngữ mới
        initializeChatSession();
        
        // Cập nhật dropdown items theo ngôn ngữ mới
        updateDropdownItems();
        
        // Kiểm tra giỏ hàng ngay để hiển thị nhắc nhở hải sản (nhanh hơn)
        setTimeout(() => {
            checkAndShowSpecialSeafoodNotifications();
        }, 300); // Giảm từ 1 giây xuống 300ms
    }
    
    // Hàm khởi tạo hiển thị ngôn ngữ ngay lập tức
    function initializeLanguageDisplay() {
        const langButton = document.querySelector('.lang-button');
        if (langButton) {
            const flag = langButton.querySelector('.flag');
            const text = langButton.querySelector('.lang-text');
            
            if (flag) flag.textContent = getFlag(currentLang);
            if (text) text.textContent = getLangName(currentLang);
        }
    }

    // Hàm cập nhật lời chào ban đầu trong chatbot
    function updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = getTranslation('chatbot_welcome');
        }
    }

    // Hàm cập nhật quick actions theo ngôn ngữ
    function updateQuickActions() {
        quickActions = [
            { text: getTranslation('view_menu') || 'Xem menu', action: 'menu' },
            { text: getTranslation('opening_hours') || 'Giờ mở cửa', action: 'hours' },
            { text: getTranslation('place_order') || 'Đặt món', action: 'order' },
            { text: getTranslation('prices') || 'Giá cả', action: 'prices' }
        ];
    }

    // Hàm dịch tin nhắn bot theo ngôn ngữ hiện tại
    function translateBotMessage(messageText) {
        // Kiểm tra và dịch các loại tin nhắn bot
        if (messageText.includes('Xin chào!') || messageText.includes('Hello!')) {
            return getTranslation('chatbot_welcome');
        } else if (messageText.includes('Lưu ý:') || messageText.includes('Note:')) {
            return getTranslation('seafood_weight_notice');
        } else {
            // Dịch các tin nhắn bot khác dựa trên nội dung
            const lowerText = messageText.toLowerCase();
            
            if (lowerText.includes('menu') || lowerText.includes('thực đơn') || lowerText.includes('món ăn')) {
                return getTranslation('bot_responses')?.menu_info?.[currentLang] || 
                       getTranslation('bot_responses')?.menu_info?.['en'] || messageText;
            } else if (lowerText.includes('giá') || lowerText.includes('price') || lowerText.includes('cost')) {
                return getTranslation('bot_responses')?.prices_info?.[currentLang] || 
                       getTranslation('bot_responses')?.prices_info?.['en'] || messageText;
            } else if (lowerText.includes('giờ') || lowerText.includes('hours') || lowerText.includes('mở cửa')) {
                return getTranslation('bot_responses')?.hours_info?.[currentLang] || 
                       getTranslation('bot_responses')?.hours_info?.['en'] || messageText;
            } else if (lowerText.includes('đặt món') || lowerText.includes('order') || lowerText.includes('đặt hàng')) {
                return getTranslation('bot_responses')?.order_info?.[currentLang] || 
                       getTranslation('bot_responses')?.order_info?.['en'] || messageText;
            } else if (lowerText.includes('hải sản') || lowerText.includes('seafood') || lowerText.includes('tôm') || lowerText.includes('cua')) {
                return getTranslation('bot_responses')?.seafood_info?.[currentLang] || 
                       getTranslation('bot_responses')?.seafood_info?.['en'] || messageText;
            } else if (lowerText.includes('địa chỉ') || lowerText.includes('address') || lowerText.includes('location')) {
                return getTranslation('bot_responses')?.location_info?.[currentLang] || 
                       getTranslation('bot_responses')?.location_info?.['en'] || messageText;
            } else if (lowerText.includes('xin lỗi') || lowerText.includes('sorry') || lowerText.includes('không hiểu')) {
                return getTranslation('bot_responses')?.default_response?.[currentLang] || 
                       getTranslation('bot_responses')?.default_response?.['en'] || messageText;
            }
        }
        
        // Nếu không tìm thấy bản dịch, trả về tin nhắn gốc
        return messageText;
    }


    
    // Khởi tạo hiển thị ngôn ngữ ngay lập tức
    initializeLanguageDisplay();
    
    // Kiểm tra và hiển thị cart ngay khi DOM load xong
    if (cart.length > 0) {
        updateCartDisplay(false);
        renderCartItems();
    }
    
    // Trigger kiểm tra nhắc nhở sau khi render giỏ hàng
    setTimeout(() => {
        checkAndShowSpecialSeafoodNotifications();
    }, 1000);
    
    // Hàm lấy bản dịch tên món ăn theo id
    function getItemTranslationById(id) {
        // Kiểm tra xem translations đã được load chưa
        if (!translations || !translations.items) {
            // Fallback: format id đẹp hơn khi translations chưa load
            return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
        
        // Xử lý ID có thể chứa timestamp
        let cleanId = id;
        
        // Nếu ID bắt đầu bằng "cart_", lấy phần itemId
        if (id.startsWith('cart_')) {
            const parts = id.split('_');
            if (parts.length >= 3) {
                cleanId = parts[1]; // Lấy phần itemId
            }
        } else {
            // Nếu ID có timestamp (chứa số dài), loại bỏ phần timestamp
            const parts = id.split('_');
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];
                // Kiểm tra xem phần cuối có phải là timestamp (số dài) không
                if (/^\d{10,}$/.test(lastPart)) {
                    cleanId = parts.slice(0, -1).join('_');
                }
            }
        }
        
        if (translations.items[cleanId]) {
            const itemTranslations = translations.items[cleanId];
            const foreignName = itemTranslations[currentLang] || itemTranslations['en'] || '';
            const vietnameseName = itemTranslations['vi'] || '';
            
            // Trả về format: (Ngôn ngữ khách hàng) - Tiếng Việt
            if (foreignName && vietnameseName) {
                return `${foreignName} - ${vietnameseName}`;
            } else if (foreignName) {
                return foreignName;
            } else if (vietnameseName) {
                return vietnameseName;
            }
        }
        // Nếu không tìm thấy bản dịch, format id đẹp hơn (sử dụng cleanId)
        return cleanId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Hàm lấy tên món ăn theo ngôn ngữ hiện tại (dùng id)
    function getItemDisplayName(item) {
        if (item && item.id) {
            // Ưu tiên sử dụng originalId nếu có (cho các món trong giỏ hàng)
            const idToUse = item.originalId || item.id;
            const result = getItemTranslationById(idToUse);
            return result;
        }
        return item.name || '';
    }
    
    // Hàm lấy tên món ăn cho thông tin chi tiết (chỉ ngôn ngữ nước ngoài, không có tiếng Việt)
    function getItemDetailDisplayName(item) {
        if (item && item.id) {
            // Ưu tiên sử dụng originalId nếu có (cho các món trong giỏ hàng)
            const idToUse = item.originalId || item.id;
            if (translations.items && translations.items[idToUse]) {
                const itemTranslations = translations.items[idToUse];
                const foreignName = itemTranslations[currentLang] || itemTranslations['en'] || '';
                // Chỉ trả về tên nước ngoài, không có tiếng Việt
                return foreignName || idToUse.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
        }
        return item.name || '';
    }
    
    // Hàm format số tiền
    function formatDisplayPrice(price) {
        if (typeof price === 'number') {
            return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        // Fallback cho trường hợp price là string
        const numericPrice = price.toString().replace(/[^\d]/g, '');
        return numericPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // Hàm lấy giá trị số từ price - tối ưu để lấy trực tiếp từ JSON
    function getNumericPrice(price) {
        if (typeof price === 'number') {
            return price;
        }
        // Chỉ parse string khi cần thiết
        const numericString = String(price).replace(/[^\d]/g, '');
        return parseInt(numericString) || 0;
    }

    // Hàm tính giá cho món theo kg - tối ưu để lấy trực tiếp từ JSON
    function calculatePerKgPrice(weightGram, pricePerKg) {
        return Math.round((weightGram / 1000) * pricePerKg);
    }

    // Hàm lấy giá tối thiểu cho món theo kg
    function getMinPriceForPerKgItem(item) {
        if (item.priceType === 'per_kg' && item.pricePerKg && item.minWeightGram) {
            return calculatePerKgPrice(item.minWeightGram, item.pricePerKg);
        }
        return getNumericPrice(item.price);
    }

    // Hàm căn giữa chỉ mục khi scroll hoặc click
    function centerCategoryOnScroll() {
        const categories = document.querySelectorAll('.category');
        const categoryButtons = document.querySelectorAll('.category-button');
        if (categories.length === 0) return;
        const offset = 200;
        let newActiveIndex = 0;
        for (let i = 0; i < categories.length; i++) {
            const rect = categories[i].getBoundingClientRect();
            if (rect.top <= offset && rect.bottom >= offset) {
                newActiveIndex = i;
                break;
            }
        }
        if (categoryButtons[newActiveIndex]) {
            categoryButtons[newActiveIndex].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }

    // Hàm thêm hiệu ứng nhảy số
    function addNumberJumpEffect(element) {
        element.classList.add('number-jump');
        setTimeout(() => {
            element.classList.remove('number-jump');
        }, 300);
    }

    // Hàm animate số tăng dần
    function animateNumber(element, startValue, endValue, duration = 500) {
        const startTime = performance.now();
        const difference = endValue - startValue;
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(startValue + (difference * easeOutQuart));
            
            element.textContent = `${formatDisplayPrice(currentValue)}đ`;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // Hàm cập nhật hiển thị giỏ hàng
    function updateCartDisplay(animate = false) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => {
            const itemPrice = item.priceType === 'per_kg' ? item.price : getNumericPrice(item.price);
            return sum + (itemPrice * item.quantity);
        }, 0);
        
        if (totalItems > 0) {
            cartButton.style.display = 'flex';
            
            if (animate && cartTotalDisplay.textContent !== '0đ') {
                const currentText = cartTotalDisplay.textContent.replace(/[^\d]/g, '');
                const currentValue = currentText ? parseInt(currentText) : 0;
                animateNumber(cartTotalDisplay, currentValue, totalPrice);
            } else {
                cartTotalDisplay.textContent = `${formatDisplayPrice(totalPrice)}đ`;
            }
        } else {
            cartButton.style.display = 'none';
            cartTotalDisplay.textContent = '0đ';
        }
        
        // Sử dụng fallback text nếu translations chưa load
        const totalText = getTranslation('total') || 'Total';
        cartTotal.textContent = `${totalText}: ${formatDisplayPrice(totalPrice)}đ`;
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Hàm thêm món vào giỏ hàng
    function addToCart(item, quantity = 1) {
        // Tạo bản sao của item với giá đã được xử lý
        const cleanItem = { 
            ...item, 
            price: item.priceType === 'per_kg' ? item.price : getNumericPrice(item.price)
        };
        
        if (cleanItem.priceType === 'per_kg') {
            // Món theo kg: luôn tạo món mới với id duy nhất nhưng giữ id gốc
            const uniqueId = `cart_${cleanItem.id}_${Date.now()}`;
            // Đảm bảo originalId là ID sạch không có timestamp
            const cleanOriginalId = cleanItem.originalId || cleanItem.id;
            cart.push({ 
                ...cleanItem, 
                id: uniqueId,
                originalId: cleanOriginalId, // Sử dụng ID sạch
                quantity: quantity,
                spicyLevel: cleanItem.canBeSpicy ? 'medium' : undefined // Set mặc định cho món có thể cay
            });
        } else {
            // Các món thường: tìm món cùng tên và cùng giá để cộng dồn
            const cleanOriginalId = cleanItem.originalId || cleanItem.id;
            const existingItem = cart.find(cartItem => 
                cartItem.priceType !== 'per_kg' &&
                cartItem.originalId === cleanOriginalId && // So sánh theo id gốc
                cartItem.price === cleanItem.price &&
                cartItem.unit === cleanItem.unit
            );
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                // Giữ lại id gốc để tra cứu bản dịch
                cart.push({ 
                    ...cleanItem, 
                    originalId: cleanOriginalId, // Sử dụng ID sạch
                    quantity: quantity,
                    spicyLevel: cleanItem.canBeSpicy ? 'medium' : undefined // Set mặc định cho món có thể cay
                });
            }
        }
        
        // Update cart item count
        cartItemCount = cart.length;
        
        updateCartDisplay(true);
        renderCartItems();
        addNumberJumpEffect(cartTotalDisplay);
        showCartNotification();
        
        // Trigger kiểm tra nhắc nhở sau khi thêm món (skip nếu party warning active)
        setTimeout(() => {
            if (!isPartyWarningActive) {
                checkAndShowSpecialSeafoodNotifications();
            }
        }, 500);
        
        // Trigger đề xuất bánh mì cho các món sốt (skip nếu party warning active)
        setTimeout(() => {
            if (!isPartyWarningActive) {
                checkAndSuggestBread();
            }
        }, 1000);
        
        // Lưu cart vào localStorage
        saveCartToLocalStorage();
        
        // Check party size trigger after adding item
        console.log('Calling checkPartySizeTrigger after adding item');
        checkPartySizeTrigger();
    }

    // Hàm render các món trong giỏ hàng
    function renderCartItems() {
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            if (item.priceType === 'per_kg') {
                // Món theo kg: hiển thị input gram
                const pricePerKg = item.pricePerKg; // Lấy trực tiếp từ JSON
                
                if (!pricePerKg) {
                    console.error('Không tìm thấy giá cho món:', getItemDisplayName(item));
                    return; // Bỏ qua món này nếu không có giá
                }
                
                let gramValue = 100; // Giá trị mặc định
                
                // Lấy giá trị gram từ unit nếu có
                if (item.unit && typeof item.unit === 'string') {
                    const gramMatch = item.unit.match(/(\d+)g/);
                    if (gramMatch) {
                        gramValue = parseInt(gramMatch[1]) || 100;
                    }
                }
                
                // Tính giá hiện tại sử dụng hàm tối ưu
                const currentPrice = calculatePerKgPrice(gramValue, pricePerKg);
                
                // Check if item can be spicy
                const spicyOptions = item.canBeSpicy ? `
                    <div class="spicy-options">
                        <span class="spicy-label">${getTranslation('spicy_level', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_level', 'vi') : ''}</span>
                        <button class="spicy-btn ${item.spicyLevel === 'none' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'none')">${getTranslation('spicy_none', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_none', 'vi') : ''}</button>
                        <button class="spicy-btn ${item.spicyLevel === 'mild' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'mild')">${getTranslation('spicy_mild', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_mild', 'vi') : ''}</button>
                        <button class="spicy-btn ${(item.spicyLevel === null || item.spicyLevel === undefined || item.spicyLevel === 'medium') ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'medium')">${getTranslation('spicy_medium', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_medium', 'vi') : ''}</button>
                        <button class="spicy-btn ${item.spicyLevel === 'hot' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'hot')">${getTranslation('spicy_hot', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_hot', 'vi') : ''}</button>
                    </div>
                ` : '';
                
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${getItemDisplayName(item)}" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">` : '<span class="no-image">No image</span>'}
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${getItemDisplayName(item).replace(/\(\d+g\)/, '')}</div>
                        <div class="cart-item-price">
                            <input type="number" class="cart-gram-input" value="${gramValue}" style="width:70px;">
                        </div>
                        ${spicyOptions}
                    </div>
                    <div class="cart-item-controls action-controls">
                        <button class="quote-btn" onclick="openPriceQuoteModalFromCart('${item.id}', ${cart.indexOf(item)})">Báo giá</button>
                        <button class="remove-btn">${getTranslation('remove') || 'Remove'}</button>
                    </div>
                `;
                
                const gramInput = cartItem.querySelector('.cart-gram-input');
                
                // Biến lưu giá trị hiện tại để tính toán
                let currentGramValue = gramValue;
                
                // Tạo element hiển thị giá riêng biệt
                const priceDisplay = document.createElement('span');
                priceDisplay.className = 'price-display';
                gramInput.parentElement.appendChild(priceDisplay);
                
                // Hàm cập nhật hiển thị giá
                function updatePriceDisplay() {
                    const newPrice = currentGramValue <= 0 ? 0 : calculatePerKgPrice(currentGramValue, pricePerKg);
                    const gramText = getTranslation('gram') || 'g';
                    const perKgText = getTranslation('per_kg') || '/kg';
                    priceDisplay.textContent = `${gramText} x ${formatDisplayPrice(pricePerKg)}đ${perKgText} = ${formatDisplayPrice(newPrice)}đ`;
                }
                
                // Cập nhật hiển thị ban đầu
                updatePriceDisplay();
                
                gramInput.addEventListener('input', (e) => {
                    const inputValue = e.target.value;
                    let displayGram = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                    
                    // Chỉ cập nhật hiển thị border đỏ, không tính toán giá
                    if (displayGram <= 0) {
                        gramInput.classList.add('input-error');
                    } else {
                        gramInput.classList.remove('input-error');
                    }
                });
                
                gramInput.addEventListener('blur', (e) => {
                    const inputValue = e.target.value;
                    let newGram = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                    
                    // Cập nhật giá trị hiện tại
                    currentGramValue = newGram;
                    
                    // Xử lý hiển thị border đỏ
                    if (newGram <= 0) {
                        gramInput.classList.add('input-error');
                        newGram = 0;
                        currentGramValue = 0;
                    } else {
                        gramInput.classList.remove('input-error');
                    }
                    
                    // Cập nhật giá sử dụng giá trị mới
                    const newPrice = newGram <= 0 ? 0 : calculatePerKgPrice(newGram, pricePerKg);
                    item.unit = `${newGram}g`;
                    item.price = newPrice;
                    item.pricePerKg = pricePerKg;
                    
                    // Cập nhật hiển thị giá
                    updatePriceDisplay();
                    
                    updateCartDisplay(true);
                });
                
                // Thêm event listener cho Enter key
                gramInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        gramInput.blur(); // Trigger blur event để cập nhật giá trị
                    }
                });
                
                cartItem.querySelector('.remove-btn').addEventListener('click', () => {
                    cart = cart.filter(cartItem => cartItem !== item);
                    cartItemCount = cart.length;
                    renderCartItems();
                    updateCartDisplay(true);
                    // Lưu cart vào localStorage
                    saveCartToLocalStorage();
                    // Check party size trigger after removing item
                    checkPartySizeTrigger();
                });
            } else {
                // Các món thường: hiển thị +/- quantity
                // Check if item can be spicy
                const spicyOptions = item.canBeSpicy ? `
                    <div class="spicy-options">
                        <span class="spicy-label">${getTranslation('spicy_level', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_level', 'vi') : ''}</span>
                        <button class="spicy-btn ${item.spicyLevel === 'none' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'none')">${getTranslation('spicy_none', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_none', 'vi') : ''}</button>
                        <button class="spicy-btn ${item.spicyLevel === 'mild' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'mild')">${getTranslation('spicy_mild', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_mild', 'vi') : ''}</button>
                        <button class="spicy-btn ${(item.spicyLevel === null || item.spicyLevel === undefined || item.spicyLevel === 'medium') ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'medium')">${getTranslation('spicy_medium', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_medium', 'vi') : ''}</button>
                        <button class="spicy-btn ${item.spicyLevel === 'hot' ? 'active' : ''}" onclick="setSpicyLevel('${item.id}', 'hot')">${getTranslation('spicy_hot', currentLang)}${currentLang !== 'vi' ? '<br>' + getTranslation('spicy_hot', 'vi') : ''}</button>
                    </div>
                ` : '';
                
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${getItemDisplayName(item)}" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">` : '<span class="no-image">No image</span>'}
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${getItemDisplayName(item)}</div>
                        <div class="cart-item-price">${formatDisplayPrice(item.price)}đ${item.unit ? ' / ' + item.unit : ''}</div>
                        ${spicyOptions}
                    </div>
                    <div class="cart-item-controls quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
                    </div>
                `;
                

            }
            
            cartItems.appendChild(cartItem);
        });
    }

    // Hàm tăng số lượng
    window.increaseQuantity = function(itemId) {
        const item = cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity += 1;
            updateCartDisplay(true);
            renderCartItems();
            addNumberJumpEffect(cartTotalDisplay);
            // Lưu cart vào localStorage
            saveCartToLocalStorage();
        }
    };

    // Hàm giảm số lượng
    window.decreaseQuantity = function(itemId) {
        const item = cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(cartItem => cartItem.id !== itemId);
            }
            // Update cart item count
            cartItemCount = cart.length;
            updateCartDisplay(true);
            renderCartItems();
            addNumberJumpEffect(cartTotalDisplay);
            // Lưu cart vào localStorage
            saveCartToLocalStorage();
            // Check party size trigger after removing item
            console.log('Calling checkPartySizeTrigger after removing item');
            checkPartySizeTrigger();
        }
    };
    
    // Hàm lưu cart vào localStorage
    function saveCartToLocalStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Không thể lưu cart vào localStorage:', e);
        }
    }
    
    // Hàm load cart từ localStorage
    function loadCartFromLocalStorage() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                cartItemCount = cart.length;
                renderCartItems();
                updateCartDisplay(false);
            }
        } catch (e) {
            console.error('Không thể load cart từ localStorage:', e);
        }
    }
    
    // Hàm set mức độ cay
    window.setSpicyLevel = function(itemId, level) {
        const item = cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.spicyLevel = level; // luôn là string: 'none', 'mild', 'medium', 'hot'
            // Lưu trạng thái mức độ cay vào localStorage
            saveCartToLocalStorage();
            renderCartItems();
        }
    };

    // Event listeners cho giỏ hàng
    cartButton.addEventListener('click', () => {
        cartModal.style.display = 'flex';
    });

    cartClose.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    deleteAllBtn.addEventListener('click', () => {
        cart = [];
        cartItemCount = 0;
        updateCartDisplay(false);
        renderCartItems();
        cartModal.style.display = 'none';
        
        // Lưu cart vào localStorage
        saveCartToLocalStorage();
        
        // Reset party size tracking when clearing cart
        hasAskedPartySize = false;
        partySizeAsked = false;
        selectedPartySize = null;
        hasShownLargePartyWarning = false;
        
        console.log('Cart cleared, resetting party size flags');
        
        // Check party size trigger after clearing cart
        checkPartySizeTrigger();
    });

    // Mở/Đóng Item Detail Modal
    itemDetailClose.addEventListener('click', () => itemDetailModal.style.display = 'none');
    itemDetailModal.addEventListener('click', (e) => {
        if (e.target === itemDetailModal) {
            itemDetailModal.style.display = 'none';
        }
    });

    // Hàm mở chi tiết món ăn
    function openItemDetailModal(item) {
        itemDetailBody.innerHTML = '';
        const imageDiv = document.createElement('div');
        imageDiv.className = 'item-detail-image';
        imageDiv.style.backgroundImage = item.image ? `url('${item.image}')` : 'none';
        if (!item.image) {
            imageDiv.innerHTML = '<span class="no-image">No image</span>';
        }
        const infoDiv = document.createElement('div');
        infoDiv.className = 'item-detail-info';
        const nameH2 = document.createElement('h2');
        nameH2.className = 'item-detail-name';
        nameH2.textContent = getItemDetailDisplayName(item);
        infoDiv.appendChild(nameH2);
        if (item.priceType === 'per_kg') {
            const unitPriceP = document.createElement('p');
            unitPriceP.className = 'item-detail-unit-price';
            unitPriceP.style.fontSize = '2em';
            unitPriceP.style.color = '#c62828';
            unitPriceP.style.marginTop = '20px';
            if (item.pricePerKg) {
                unitPriceP.textContent = `${formatDisplayPrice(item.pricePerKg)}đ / kg`;
            } else {
                unitPriceP.textContent = 'Giá không có sẵn';
            }
            infoDiv.appendChild(unitPriceP);
            const optionsList = document.createElement('div');
            optionsList.className = 'item-options-list';
            // Thêm class many-options nếu có 6 options trở lên
            if (item.options.length >= 6) {
                optionsList.classList.add('many-options');
            }
            item.options.forEach((opt, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'item-option-btn';
                if (index === 0) optionBtn.classList.add('active');
                optionBtn.dataset.weight = opt.weightGram;
                optionBtn.textContent = `${opt.weightGram}g`;
                optionsList.appendChild(optionBtn);
            });
            infoDiv.appendChild(optionsList);
            const addBtn = document.createElement('button');
            addBtn.className = 'item-detail-add-btn';
            let selectedWeight = item.options[0].weightGram;
            const updatePrice = () => {
                if (item.pricePerKg) {
                    const newPrice = calculatePerKgPrice(selectedWeight, item.pricePerKg);
                    addBtn.textContent = `${getTranslation('add_to_cart')} - ${formatDisplayPrice(newPrice)}đ`;
                } else {
                    addBtn.textContent = `${getTranslation('add_to_cart')} - ${getTranslation('price_not_available')}`;
                }
            };
            optionsList.querySelectorAll('.item-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    optionsList.querySelector('.item-option-btn.active')?.classList.remove('active');
                    btn.classList.add('active');
                    selectedWeight = Number(btn.dataset.weight);
                    updatePrice();
                });
            });

            
            addBtn.addEventListener('click', () => {
                console.log('Adding per_kg item to cart from modal:', item.id);
                if (item.pricePerKg) {
                    const pricePerKg = item.pricePerKg;
                    const price = calculatePerKgPrice(selectedWeight, pricePerKg);
                    // Always use the clean menu item id for originalId
                    let cleanId = item.id;
                    if (item.id && typeof item.id === 'string') {
                        const parts = item.id.split('_');
                        if (parts.length > 1) {
                            const lastPart = parts[parts.length - 1];
                            // Check if the last part is a timestamp (long number)
                            if (/^\d{10,}$/.test(lastPart)) {
                                cleanId = parts.slice(0, -1).join('_');
                            }
                        }
                    }
                    addToCart({
                        id: `${item.id}_${Date.now()}`,
                        originalId: cleanId, // Always clean id
                        image: item.image,
                        price: price,
                        quantity: 1,
                        unit: `${selectedWeight}g`,
                        priceType: 'per_kg',
                        pricePerKg: pricePerKg,
                        canBeSpicy: item.canBeSpicy // Truyền thuộc tính canBeSpicy
                    });
                    itemDetailModal.style.display = 'none';
                } else {
                    alert(getTranslation('cannot_add_item_no_price'));
                }
            });
            
            // Thêm div spacer để đẩy nút xuống đáy
            const spacerDiv = document.createElement('div');
            spacerDiv.style.flex = '1';
            spacerDiv.style.minHeight = '20px';
            infoDiv.appendChild(spacerDiv);
            
            infoDiv.appendChild(addBtn);
            updatePrice();
        } else if (item.priceType === 'options') {
            // Xử lý món có nhiều option giá
            const unitPriceP = document.createElement('p');
            unitPriceP.className = 'item-detail-unit-price';
            unitPriceP.style.fontSize = '2em';
            unitPriceP.style.color = '#c62828';
            unitPriceP.style.marginTop = '20px';
            unitPriceP.textContent = `${getTranslation('select_size')}`;
            infoDiv.appendChild(unitPriceP);
            
            const optionsList = document.createElement('div');
            optionsList.className = 'item-options-list';
            // Thêm class many-options nếu có 6 options trở lên
            if (item.options.length >= 6) {
                optionsList.classList.add('many-options');
            }
            item.options.forEach((opt, index) => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'item-option-btn';
                if (index === 0) optionBtn.classList.add('active');
                optionBtn.dataset.optionId = opt.id;
                optionBtn.dataset.price = opt.price;
                optionBtn.dataset.size = opt.size;
                optionBtn.textContent = `${getItemTranslationById(opt.id)} - ${formatDisplayPrice(opt.price)}đ`;
                optionsList.appendChild(optionBtn);
            });
            infoDiv.appendChild(optionsList);
            
            const addBtn = document.createElement('button');
            addBtn.className = 'item-detail-add-btn';
            let selectedOption = item.options[0];
            
            const updatePrice = () => {
                addBtn.textContent = `${getTranslation('add_to_cart')} - ${formatDisplayPrice(selectedOption.price)}đ`;
            };
            
            optionsList.querySelectorAll('.item-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    optionsList.querySelector('.item-option-btn.active')?.classList.remove('active');
                    btn.classList.add('active');
                    selectedOption = {
                        id: btn.dataset.optionId,
                        price: Number(btn.dataset.price),
                        size: btn.dataset.size
                    };
                    updatePrice();
                });
            });
            
            addBtn.addEventListener('click', () => {
                console.log('Adding options item to cart from modal:', selectedOption.id);
                addToCart({
                    id: selectedOption.id,
                    originalId: selectedOption.id,
                    image: item.image,
                    price: selectedOption.price,
                    quantity: 1,
                    unit: item.unit,
                    size: selectedOption.size,
                    canBeSpicy: item.canBeSpicy // Truyền thuộc tính canBeSpicy
                });
                itemDetailModal.style.display = 'none';
            });
            
            // Thêm div spacer để đẩy nút xuống đáy
            const spacerDiv = document.createElement('div');
            spacerDiv.style.flex = '1';
            spacerDiv.style.minHeight = '20px';
            infoDiv.appendChild(spacerDiv);
            
            infoDiv.appendChild(addBtn);
            updatePrice();
        } else {
            const priceP = document.createElement('p');
            priceP.className = 'item-detail-unit-price';
            priceP.style.fontSize = '2em';
            priceP.style.color = '#c62828';
            priceP.style.marginTop = '20px';
            priceP.textContent = `${formatDisplayPrice(item.price)}đ ${item.unit ? '/ ' + item.unit : ''}`;
            infoDiv.appendChild(priceP);
            
            // Thêm div spacer để đẩy nút xuống đáy
            const spacerDiv = document.createElement('div');
            spacerDiv.style.flex = '1';
            spacerDiv.style.minHeight = '20px';
            infoDiv.appendChild(spacerDiv);
            
            const addBtn = document.createElement('button');
            addBtn.className = 'item-detail-add-btn simple';
            addBtn.textContent = getTranslation('add_to_cart');
            addBtn.addEventListener('click', () => {
                console.log('Adding simple item to cart from modal:', item.id);
                addToCart({ 
                    ...item, 
                    originalId: item.id, // Giữ lại id gốc
                    quantity: 1,
                    canBeSpicy: item.canBeSpicy // Truyền thuộc tính canBeSpicy
                });
                itemDetailModal.style.display = 'none';
            });
            infoDiv.appendChild(addBtn);
        }
        itemDetailBody.appendChild(imageDiv);
        itemDetailBody.appendChild(infoDiv);
        itemDetailModal.style.display = 'flex';
    }

    // Hàm cập nhật ngôn ngữ cho item detail modal
    function updateItemDetailModalLanguage() {
        if (itemDetailModal.style.display === 'flex') {
            // Tìm nút "Add to Cart" trong modal và cập nhật text
            const addBtn = itemDetailModal.querySelector('.item-detail-add-btn');
            if (addBtn) {
                if (addBtn.classList.contains('simple')) {
                    // Nút đơn giản
                    addBtn.textContent = getTranslation('add_to_cart');
                } else {
                    // Nút có giá - cần tính lại giá
                    const priceText = addBtn.textContent.match(/-\s*([^đ]+)đ/);
                    if (priceText) {
                        const price = priceText[1].replace(/[^\d]/g, '');
                        addBtn.textContent = `${getTranslation('add_to_cart')} - ${formatDisplayPrice(Number(price))}đ`;
                    } else {
                        // Nếu không có giá, chỉ cập nhật text
                        addBtn.textContent = getTranslation('add_to_cart');
                    }
                }
            }
            
            // Cập nhật thông báo lỗi nếu có
            const errorText = itemDetailModal.querySelector('.error-message');
            if (errorText && errorText.textContent.includes('Không thể thêm món này')) {
                errorText.textContent = getTranslation('cannot_add_item_no_price');
            }
        }
    }

    // Event listener cho language switcher
    langSwitcher.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('open');
    });
    
    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', function() {
        langSwitcher.classList.remove('open');
    });
    
    // Xử lý chọn ngôn ngữ
    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedLang = this.dataset.value;
            currentLang = selectedLang;
            // Lưu ngôn ngữ vào localStorage
            localStorage.setItem('currentLang', currentLang);
            
            // Cập nhật hiển thị ngôn ngữ ngay lập tức
            updateLanguageDisplay(currentLang);
            langSwitcher.classList.remove('open');
            
            // Load lại menu data và render với ngôn ngữ mới
            fetch('menu-data.json?v=' + Date.now())
                .then(response => response.json())
                .then(data => {
                    renderMenu();
                    renderCartItems();
                    
                                // Cập nhật lời chào ban đầu trong chatbot
            updateWelcomeMessage();
            updateQuickActions();
            // updateChatHistoryLanguage(); // Tạm thời comment lại vì chưa cần thiết
            
            // Cập nhật item detail modal nếu đang mở
            updateItemDetailModalLanguage();
                    
                    // Khởi tạo lại chỉ mục sau khi đổi ngôn ngữ
                    setTimeout(() => {
                        centerCategoryOnScroll();
                    }, 100);
                })
                .catch(error => {
                    console.error('Error fetching menu data:', error);
                });
        });
    });

    // Hàm render menu
    function renderMenu() {
        if (!menuContainer || !menuData || !categoryNav) {
            return;
        }
        
        // Kiểm tra xem translations đã được load chưa
        if (!translations || !translations.items) {
            console.warn('Translations not loaded yet, rendering menu with fallback names');
            // Đợi một chút để translations load xong
            setTimeout(() => {
                if (translations && translations.items) {
                    renderMenu();
                }
            }, 100);
            return;
        }
        
        // Xóa nội dung cũ
        menuContainer.innerHTML = '';
        categoryNav.innerHTML = '';
        
        menuData.menu.forEach(category => {
            // Create category button
            const categoryButton = document.createElement('button');
            categoryButton.classList.add('category-button');
            categoryButton.textContent = getCategoryTranslation(category.category);
            categoryButton.dataset.target = `category-${category.category.replace(/\s+/g, '-')}`;
            categoryNav.appendChild(categoryButton);

            categoryButton.addEventListener('click', () => {
                isScrolling = true;
                wasClicked = true;
                // Xóa bôi đen tất cả buttons ngay lập tức
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                document.getElementById(categoryButton.dataset.target)?.scrollIntoView();
                categoryButton.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
                
                // Reset flag sau khi scroll hoàn thành
                setTimeout(() => {
                    isScrolling = false;
                    wasClicked = false;
                }, 1000);
            });

            // Create menu section
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.id = `category-${category.category.replace(/\s+/g, '-')}`;

            const categoryTitle = document.createElement('h2');
            categoryTitle.classList.add('category-title');
            categoryTitle.textContent = getCategoryTranslation(category.category);
            categoryDiv.appendChild(categoryTitle);

            // Grid for items
            const gridDiv = document.createElement('div');
            gridDiv.className = 'category-grid';

            category.items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'menu-card';

                card.addEventListener('click', () => {
                    openItemDetailModal(item);
                });

                // Image
                const imgDiv = document.createElement('div');
                imgDiv.className = 'menu-card-image';
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image;
                    img.alt = getItemDisplayName(item);
                    img.onerror = function() {
                        this.parentElement.innerHTML = '<span class="no-image">No image</span>';
                    };
                    imgDiv.appendChild(img);
                } else {
                    const noImg = document.createElement('span');
                    noImg.className = 'no-image';
                    noImg.textContent = 'No image';
                    imgDiv.appendChild(noImg);
                }
                card.appendChild(imgDiv);

                // Content
                const contentDiv = document.createElement('div');
                contentDiv.className = 'menu-card-content';
                
                const title = document.createElement('div');
                title.className = 'menu-card-title';
                title.textContent = getItemDisplayName(item);
                contentDiv.appendChild(title);
                
                const price = document.createElement('div');
                price.className = 'menu-card-price';
                if (item.priceType === 'per_kg') {
                    const minPrice = getMinPriceForPerKgItem(item);
                    price.textContent = `${getTranslation('from')} ${formatDisplayPrice(minPrice)}đ`;
                } else if (item.priceType === 'options') {
                    // Hiển thị giá thấp nhất từ các options
                    const minPrice = Math.min(...item.options.map(option => option.price));
                    price.textContent = `${getTranslation('from')} ${formatDisplayPrice(minPrice)}đ`;
                } else {
                    price.textContent = formatDisplayPrice(item.price);
                }
                contentDiv.appendChild(price);
                
                // Bottom row với unit và nút thêm vào giỏ hàng
                const bottomRow = document.createElement('div');
                bottomRow.className = 'menu-card-bottom-row';
                
                // Unit (lề trái)
                if (item.unit) {
                    const unit = document.createElement('span');
                    unit.className = 'menu-card-unit';
                    unit.textContent = item.unit;
                    bottomRow.appendChild(unit);
                } else if (item.priceType === 'per_kg') {
                    const unit = document.createElement('span');
                    unit.className = 'menu-card-unit';
                    const minWeight = item.minWeightGram || 700;
                    unit.textContent = `${getTranslation('from')} ${minWeight}${getTranslation('gram')}`;
                    bottomRow.appendChild(unit);
                }
                else {
                    const emptyDiv = document.createElement('div');
                    bottomRow.appendChild(emptyDiv);
                }
                
                // Nút thêm vào giỏ hàng (lề phải)
                const addBtn = document.createElement('button');
                addBtn.className = 'add-to-cart-btn';
                addBtn.textContent = '+';
                addBtn.title = getTranslation('add_to_cart');
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (item.priceType === 'per_kg') {
                        // Món theo kg: mở modal để chọn khối lượng
                        openItemDetailModal(item);
                    } else if (item.priceType === 'options') {
                        // Món có options: mở modal để chọn option
                        openItemDetailModal(item);
                    } else {
                        // Món thường: trực tiếp thêm vào giỏ hàng
                        console.log('Adding regular item to cart:', item.id);
                        addToCart({ 
                            ...item, 
                            originalId: item.id, // Giữ lại id gốc
                            quantity: 1,
                            canBeSpicy: item.canBeSpicy // Truyền thuộc tính canBeSpicy
                        });
                    }
                });
                bottomRow.appendChild(addBtn);
                
                contentDiv.appendChild(bottomRow);
                card.appendChild(contentDiv);

                gridDiv.appendChild(card);
            });

            categoryDiv.appendChild(gridDiv);
            
            const clearfixDiv = document.createElement('div');
            clearfixDiv.className = 'clearfix';
            categoryDiv.appendChild(clearfixDiv);
            
            menuContainer.appendChild(categoryDiv);
        });
    }

    // Load translations
    fetch('translations.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            translations = data;
            // console.log('Translations loaded successfully:', Object.keys(translations.items || {}).length, 'items');
            // Đảm bảo currentLang là 'en' cho lần đầu load
            if (!localStorage.getItem('currentLang')) {
                currentLang = 'en';
                localStorage.setItem('currentLang', 'en');
            }
            // Cập nhật hiển thị ngôn ngữ ngay sau khi load translations
            updateLanguageDisplay(currentLang);
            // Sau khi load translations, load menu data
            return fetch('menu-data.json?v=' + Date.now());
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            menuData = data;
            // console.log('Menu data loaded successfully:', data.menu.length, 'categories');
            // Render menu sau khi đã load cả translations và menu data
            renderMenu();
            updateLanguageDisplay(currentLang);
            
            // Cập nhật các phần khác theo ngôn ngữ
            updateWelcomeMessage();
            updateQuickActions();
            // updateChatHistoryLanguage(); // Tạm thời comment lại vì chưa cần thiết
            
            // Khởi tạo phiên chat mới
            initializeChatSession();
            
            // Cập nhật tên nhà hàng và giờ mở cửa
            const restaurantNameElement = document.getElementById('restaurant-name');
            if (restaurantNameElement) {
                restaurantNameElement.textContent = data.restaurantName;
            }

            const openingHoursElement = document.getElementById('opening-hours');
            if (openingHoursElement && data.openingHours) {
                const hoursList = data.openingHours.map(item => `${item.day}: ${item.hours}`).join(' | ');
                openingHoursElement.textContent = hoursList;
            }
            
            // Cập nhật hiển thị giỏ hàng sau khi translations đã sẵn sàng
            updateCartDisplay(false);
            renderCartItems();
            
            // Khởi tạo chỉ mục đầu tiên
            setTimeout(() => {
                centerCategoryOnScroll();
            }, 100);
            
            // Initialize cart item count
            cartItemCount = cart.length;
            

        })
        .catch(error => {
            console.error('Error loading data:', error);
            // Fallback: load menu data even if translations fail
            fetch('menu-data.json?v=' + Date.now())
                .then(response => response.json())
                .then(data => {
                    menuData = data;
                    renderMenu();
                })
                .catch(err => console.error('Failed to load menu data:', err));
        });

    // Scroll-to-top button logic
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            // Ẩn/hiện nút scroll-to-top dựa trên vị trí scroll
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
            centerCategoryOnScroll();
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Function to recheck dish recommendation buttons when chat is opened
    function recheckDishRecommendationButtons() {
        // Find all dish recommendation buttons in chat
        const chatButtons = document.querySelectorAll('.chat-dish-add-btn');
        
        chatButtons.forEach(button => {
            // Extract dish ID from onclick attribute
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('addRecommendedDishWithQuantity')) {
                const match = onclickAttr.match(/addRecommendedDishWithQuantity\('([^']+)'/);
                if (match) {
                    const dishId = match[1];
                    
                    // Check if this dish is already in cart with quantity > 1
                    const cartItem = cart.find(item => (item.originalId || item.id) === dishId);
                    if (cartItem && cartItem.quantity > 1) {
                        // Update button state
                        button.disabled = true;
                        if (selectedPartySize === '8+') {
                            button.textContent = 'Đã thêm 2';
                        } else {
                            button.textContent = 'Đã thêm';
                        }
                        button.style.background = '#28a745';
                    }
                }
            }
        });
    }

    // Chatbot event listeners
    if (chatButton && chatWindow && chatClose && chatMessages && chatInput && chatSend) {
        // Toggle chat window
        chatButton.addEventListener('click', () => {
            // console.log('Chat button clicked');
            if (!chatWindow) {
                console.error('chatWindow is null or undefined');
                return;
            }
            isChatOpen = !isChatOpen;
            if (isChatOpen) {
                chatWindow.classList.add('active');
                chatWindow.style.display = 'flex';
                // console.log('Chat window opened');
                addChatOverlay();
                
                // Recheck dish recommendation buttons when chat is opened
                setTimeout(() => {
                    recheckDishRecommendationButtons();
                }, 100); // Small delay to ensure DOM is ready
            } else {
                chatWindow.classList.remove('active');
                chatWindow.style.display = 'none';
                // console.log('Chat window closed');
                removeChatOverlay();
            }
            if (chatNotification) {
                if (isChatOpen) {
                    // Khi mở chat, ẩn notification badge
                    chatNotification.style.display = 'none';
                } else {
                    // Khi đóng chat, hiển thị lại notification badge nếu có tin nhắn
                    if (chatHistory.length > 0) {
                        chatNotification.style.display = 'flex';
                        chatNotification.textContent = '!';
                    }
                }
            }
        });
    } else {
        console.error('Chat button not found');
    }

            if (chatClose) {
            chatClose.addEventListener('click', () => {
                // console.log('Chat close clicked');
                isChatOpen = false;
                chatWindow.classList.remove('active');
                chatWindow.style.display = 'none';
                removeChatOverlay();
                
                // Hiển thị lại notification badge nếu có tin nhắn
                if (chatNotification && chatHistory.length > 0) {
                    chatNotification.style.display = 'flex';
                    chatNotification.textContent = '!';
                }
            });
        } else {
            console.error('Chat close button not found');
        }

    if (chatSendButton) {
        chatSendButton.addEventListener('click', sendMessage);
    } else {
        console.error('Chat send button not found');
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error('Chat input not found');
    }

    // Add event listener for robot icon click to reset chatbot
    const chatTitleIcon = document.querySelector('.chat-title i');
    if (chatTitleIcon) {
        chatTitleIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log('Robot icon clicked - handling reset confirmation');
            handleResetConfirmation();
        });
    } else {
        console.error('Chat title robot icon not found');
    }
    
    // console.log('Chatbot initialized successfully');

    // Process message and generate response
    async function processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Nếu đã kết nối với Ollama, sử dụng AI
        if (ollamaConnected) {
            try {
                const response = await sendToOllama(message);
                return response;
            } catch (error) {
                console.error('Ollama error, falling back to basic responses:', error);
                // Fallback to basic responses if Ollama fails
                ollamaConnected = false;
            }
        }
        
        // Fallback responses khi không kết nối được Ollama
        const fallbackResponses = {
            greetings: {
                patterns: ['xin chào', 'hello', 'hi', 'chào', 'hey'],
                responseKey: 'greetings'
            },
            menu: {
                patterns: ['menu', 'thực đơn', 'món ăn', 'food', 'dishes'],
                responseKey: 'menu_info'
            },
            prices: {
                patterns: ['giá', 'price', 'cost', 'bao nhiêu', 'how much'],
                responseKey: 'prices_info'
            },
            hours: {
                patterns: ['giờ', 'hours', 'mở cửa', 'open', 'đóng cửa', 'close'],
                responseKey: 'hours_info'
            },
            location: {
                patterns: ['địa chỉ', 'address', 'location', 'ở đâu', 'where'],
                responseKey: 'location_info'
            },
            order: {
                patterns: ['đặt món', 'order', 'đặt hàng', 'book', 'reservation'],
                responseKey: 'order_info'
            },
            seafood: {
                patterns: ['hải sản', 'seafood', 'tôm', 'cua', 'cá', 'mực'],
                responseKey: 'seafood_info'
            }
        };
        
        // Check for patterns in knowledge base
        for (const [category, data] of Object.entries(fallbackResponses)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern)) {
                    // Lấy response key và sử dụng bản dịch
                    const responseKey = data.responseKey;
                    return translations.bot_responses?.[responseKey]?.[currentLang] || 
                           translations.bot_responses?.[responseKey]?.['en'] || 
                           'Response not found';
                }
            }
        }

        // Default response
        return translations.bot_responses?.default_response?.[currentLang] || 
               translations.bot_responses?.default_response?.['en'] || 
               'I\'m sorry, I don\'t understand clearly.';
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Toast notification system functions
    function showToastMessage(text, sender, duration = 8000) {
        const now = Date.now();
        
        // Check cooldown to prevent spam
        if (now - lastToastTime < TOAST_COOLDOWN) {
            return;
        }
        
        // Skip toast if party warning is active (except for dish recommendations)
        if (isPartyWarningActive && !text.includes('dish') && !text.includes('recommendation')) {
            console.log('Skipping toast due to party warning active:', text.substring(0, 50));
            return;
        }
        
        // Tạm thời disable tất cả toast khi party warning đang active
        if (isPartyWarningActive) {
            console.log('Skipping all toasts due to party warning active:', text.substring(0, 50));
            return;
        }
        
        // Hiển thị đầy đủ nội dung tin nhắn trong toast
        const toast = {
            text: text,
            sender: sender,
            duration: duration,
            timestamp: new Date()
        };
        
        toastQueue.push(toast);
        lastToastTime = now;
        
        if (!isShowingToast) {
            processToastQueue();
        }
    }

    function processToastQueue() {
        if (toastQueue.length === 0) {
            isShowingToast = false;
            return;
        }
        isShowingToast = true;
        const toast = toastQueue.shift();
        const toastElement = document.createElement('div');
        toastElement.className = `toast-message ${toast.sender}`;
        const time = toast.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        toastElement.innerHTML = `
            <div class="toast-message-content">
                <div class="toast-message-icon">
                    <i class="fas fa-${toast.sender === 'bot' ? 'robot' : 'user'}"></i>
                </div>
                <div class="toast-message-text">${toast.text}</div>
            </div>
            <div class="toast-message-time">${time}</div>
            <div class="toast-progress" style="animation-duration: ${toast.duration}ms;"></div>
        `;
        toastContainer.appendChild(toastElement);
        
        // Thêm event listener để click vào toast thì biến mất ngay lập tức
        toastElement.addEventListener('click', (e) => {
            // Không đóng toast nếu click vào button hoặc các element con khác
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            // Tắt progress bar ngay lập tức
            const progress = toastElement.querySelector('.toast-progress');
            if (progress) {
                progress.classList.add('hide');
            }
            
            // Ẩn toast ngay lập tức
            toastElement.classList.add('hide');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                processToastQueue();
            }, 100);
        });
        
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 100);
        
        // Hide after duration
        setTimeout(() => {
            // Tắt progress bar ngay khi toast bắt đầu ẩn
            const progress = toastElement.querySelector('.toast-progress');
            if (progress) {
                progress.classList.add('hide');
            }
            
            toastElement.classList.add('hide');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                processToastQueue();
            }, 100);
        }, toast.duration);
    }

    // Add message to chat
    function addMessage(text, sender, showQuickActions = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
                <div class="message-text">${text}</div>
            </div>
            <div class="message-time">${time}</div>
        `;

        // Add quick actions for bot messages only when showQuickActions is true
        if (sender === 'bot' && showQuickActions) {
            const quickActionsDiv = document.createElement('div');
            quickActionsDiv.className = 'quick-actions';
            quickActions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'quick-action-btn';
                btn.textContent = action.text;
                btn.addEventListener('click', async () => {
                    addMessage(action.text, 'user');
                    setTimeout(async () => {
                        const response = await processMessage(action.text);
                        addMessage(response, 'bot');
                        
                        // Show toast notification if chat is closed
                        if (!isChatOpen) {
                            showToastMessage(response, 'bot', 8000);
                        }
                    }, 500);
                });
                quickActionsDiv.appendChild(btn);
            });
            messageDiv.appendChild(quickActionsDiv);
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show toast notification if chat is closed (like Facebook)
        // Tạm thời disable toast khi party warning đang active
        if (!isChatOpen && sender === 'bot' && !isPartyWarningActive) {
            showToastMessage(text, sender, 8000);
        }

        // Store in history (only for current session, not localStorage)
        chatHistory.push({ text, sender, time: new Date() });
        
        // Update notification badge - hiển thị dấu thăng khi có tin nhắn mới
        if (chatNotification && !isChatOpen) {
            chatNotification.style.display = 'flex';
            chatNotification.textContent = '!';
        }
    }

    // Send message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Process message and get response
        try {
            const response = await processMessage(message);
            hideTypingIndicator();
            addMessage(response, 'bot');
            
            // Show toast notification if chat is closed
            if (!isChatOpen) {
                showToastMessage(response, 'bot', 8000);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            hideTypingIndicator();
            const errorResponse = 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';
            addMessage(errorResponse, 'bot');
        }
    }

    // Cart notification integration
    function showCartNotification() {
        if (!isChatOpen) {
            chatNotification.style.display = 'flex';
            chatNotification.textContent = cart.length;
        }
    }



    // Function to initialize fresh chat session
    function initializeChatSession() {
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Reset chat history khi khởi tạo phiên mới
        chatHistory = [];
        
        // Hiển thị tin nhắn chào
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message bot-message';
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="message-text">${getTranslation('chatbot_welcome')}</div>
            </div>
            <div class="message-time">Bây giờ</div>
        `;
        chatMessages.appendChild(welcomeDiv);
        
        // Hiển thị toast chào mừng (nhanh hơn)
        setTimeout(() => {
            showToastMessage(getTranslation('chatbot_welcome'), 'bot', 8000);
        }, 200); // Giảm từ 500ms xuống 200ms
        
        // Check for special seafood items in cart and show notifications (skip nếu party warning active)
        if (!isPartyWarningActive) {
            checkAndShowSpecialSeafoodNotifications();
        }
    }

    // Function to clear all chat data for testing
    window.clearChatData = function() {
        // console.log('Clearing all chat data...');
        chatHistory = [];
        shownSpecialNotificationGroups = [];
        hasShownGeneralNotification = false;
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('shownSpecialNotificationGroups');
        localStorage.removeItem('hasShownGeneralNotification');
        
        // Clear chat messages display
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <i class="fas fa-robot"></i>
                        <div class="message-text">
                            ${getTranslation('chatbot_welcome')}
                        </div>
                    </div>
                    <div class="message-time">Bây giờ</div>
                </div>
            `;
        }
        
        // Chỉ hiển thị toast notification cho tin nhắn chào, không thêm vào chat history
        setTimeout(() => {
            const welcomeMessage = 'Xin chào! Tôi có thể giúp gì cho bạn? Bạn có thể hỏi về menu, đặt món, hoặc tìm hiểu thông tin nhà hàng.';
            
            // Chỉ hiển thị toast, không gọi addMessage
            if (!isChatOpen) {
                showToastMessage(welcomeMessage, 'bot', 8000);
            }
            
            // Show notification badge
            if (chatNotification) {
                chatNotification.style.display = 'flex';
                chatNotification.textContent = '!';
            }
        }, 1000);
        
        // console.log('Chat data cleared successfully');
        alert('Đã xóa sạch dữ liệu chat!');
    };



    // Variables for reset confirmation
    let resetConfirmationActive = false;
    let resetConfirmationTimeout = null;
    const originalTitle = 'Restaurant Assistant';

    // Function to reset chatbot completely
    function resetChatbot() {
        // console.log('Resetting chatbot...');
        
        // Reset special notifications
        shownSpecialNotifications = {};
        
        // Reset party size tracking
        hasAskedPartySize = false;
        partySizeAsked = false;
        selectedPartySize = null;
        
        // Clear chat history array
        chatHistory = [];
        
        // Clear chat messages
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Close chat window properly
        isChatOpen = false;
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.classList.remove('active');
            chatWindow.style.display = 'none';
        }
        removeChatOverlay();
        
        // Reset notification badge
        if (chatNotification) {
            chatNotification.style.display = 'none';
        }
        
        // Initialize fresh chat session
        initializeChatSession();
        
        // Show toast notification for reset
        showToastMessage('🤖 Chatbot đã được reset thành công!', 'bot', 3000);
        
        // console.log('Chatbot reset completed');
    }

    // Function to handle reset confirmation
    function handleResetConfirmation() {
        const chatTitleSpan = document.querySelector('.chat-title span');
        
        if (!resetConfirmationActive) {
            // First click - show confirmation
            // console.log('First click - showing reset confirmation');
            resetConfirmationActive = true;
            
            // Change title to confirmation message
            if (chatTitleSpan) {
                chatTitleSpan.textContent = 'Reclick for reset';
            }
            
            // Set timeout to revert title after 2 seconds
            resetConfirmationTimeout = setTimeout(() => {
                if (chatTitleSpan) {
                    chatTitleSpan.textContent = originalTitle;
                }
                resetConfirmationActive = false;
                // console.log('Reset confirmation timeout - reverted title');
            }, 2000);
            
        } else {
            // Second click within 2 seconds - actually reset
            // console.log('Second click - confirming reset');
            
            // Clear timeout
            if (resetConfirmationTimeout) {
                clearTimeout(resetConfirmationTimeout);
                resetConfirmationTimeout = null;
            }
            
            // Revert title immediately
            if (chatTitleSpan) {
                chatTitleSpan.textContent = originalTitle;
            }
            
            // Reset confirmation state
            resetConfirmationActive = false;
            
            // Actually perform the reset
            resetChatbot();
        }
    }

    // Hàm kiểm tra kết nối Ollama
    async function checkOllamaConnection() {
        try {
            const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                // console.log('Ollama connection successful:', data);
                
                if (data.status === 'healthy') {
                    showToastMessage('✅ Đã kết nối với Ollama thành công!', 'bot', 3000);
                    return true;
                } else {
                    showToastMessage('⚠️ Ollama không khỏe mạnh: ' + data.error, 'bot', 5000);
                    return false;
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Ollama connection failed:', error);
            showToastMessage('❌ Không thể kết nối với Ollama. Sử dụng chatbot cơ bản.', 'bot', 5000);
            return false;
        }
    }

    // Hàm gửi tin nhắn đến Ollama
    async function sendToOllama(message) {
        try {
            const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    return data.response;
                } else {
                    // Sử dụng fallback message nếu có
                    return data.fallback || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error sending message to Ollama:', error);
            throw error;
        }
    }

    // Keyboard detection and chat window adjustment
    let initialViewportHeight = window.innerHeight;
    let originalChatWindowBottom = null;
    let isKeyboardOpen = false;
    let keyboardDetectionTimeout = null;

    // Function to detect keyboard and adjust chat window
    function handleViewportResize() {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;

        // Lưu vị trí ban đầu nếu chưa có
        if (originalChatWindowBottom === null) {
            originalChatWindowBottom = chatWindow.style.bottom;
        }

        const currentViewportHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentViewportHeight;

        // console.log('Viewport resize detected:', {
        //     initialHeight: initialViewportHeight,
        //     currentHeight: currentViewportHeight,
        //     difference: heightDifference,
        //     isKeyboardOpen: isKeyboardOpen
        // });

        // Clear previous timeout
        if (keyboardDetectionTimeout) {
            clearTimeout(keyboardDetectionTimeout);
        }

        // Set new timeout
        keyboardDetectionTimeout = setTimeout(() => {
            if (heightDifference > 150) {
                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    // console.log('Keyboard detected as open');
                    
                    // Adjust chat window for keyboard
                    chatWindow.classList.add('keyboard-open');
                }
            } else {
                if (isKeyboardOpen) {
                    isKeyboardOpen = false;
                    // console.log('Keyboard detected as closed');
                    
                    // Restore chat window position
                    chatWindow.classList.remove('keyboard-open');
                }
            }
        }, 300);
    }

    // Enhanced keyboard detection with multiple methods
    function enhancedKeyboardDetection() {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;

        // Method 1: Viewport height change
        const currentViewportHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentViewportHeight;

        // Method 2: Visual viewport API (modern browsers)
        let visualViewportHeight = currentViewportHeight;
        if (window.visualViewport) {
            visualViewportHeight = window.visualViewport.height;
        }

        // Method 3: Document height change
        const documentHeight = document.documentElement.clientHeight;
        const bodyHeight = document.body.clientHeight;

        // console.log('Enhanced keyboard detection:', {
        //     windowInnerHeight: currentViewportHeight,
        //     visualViewportHeight: visualViewportHeight,
        //     documentHeight: documentHeight,
        //     bodyHeight: bodyHeight,
        //     heightDifference: heightDifference,
        //     isKeyboardOpen: isKeyboardOpen
        // });

        // Use the most reliable method
        const effectiveHeight = window.visualViewport ? window.visualViewport.height : currentViewportHeight;
        const effectiveDifference = initialViewportHeight - effectiveHeight;

        if (effectiveDifference > 150 && !isKeyboardOpen) {
            // console.log('Enhanced keyboard detection: OPEN');
            isKeyboardOpen = true;
            chatWindow.classList.add('keyboard-open');
            chatWindow.style.bottom = 'auto';
            chatWindow.style.top = '10px';
            chatWindow.style.height = '500px';
            
            setTimeout(() => {
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }, 100);
            
        } else if (effectiveDifference < 50 && isKeyboardOpen) {
            // console.log('Enhanced keyboard detection: CLOSED');
            isKeyboardOpen = false;
            chatWindow.classList.remove('keyboard-open');
            chatWindow.style.top = 'auto';
            chatWindow.style.bottom = originalChatWindowBottom || '80px';
            chatWindow.style.height = '500px';
        }
    }

    // Multiple event listeners for better detection
    window.addEventListener('resize', () => {
        if (keyboardDetectionTimeout) {
            clearTimeout(keyboardDetectionTimeout);
        }
        keyboardDetectionTimeout = setTimeout(enhancedKeyboardDetection, 100);
    });

    // Visual viewport API (modern browsers)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (keyboardDetectionTimeout) {
                clearTimeout(keyboardDetectionTimeout);
            }
            keyboardDetectionTimeout = setTimeout(enhancedKeyboardDetection, 100);
        });
    }

    // Focus/blur events on input fields
    document.addEventListener('focusin', (event) => {
        if (event.target.id === 'chat-input') {
            // console.log('Chat input focused - potential keyboard opening');
            // Delay detection to allow keyboard to open
            setTimeout(enhancedKeyboardDetection, 300);
        }
    });

    document.addEventListener('focusout', (event) => {
        if (event.target.id === 'chat-input') {
            // console.log('Chat input blurred - potential keyboard closing');
            // Delay detection to allow keyboard to close
            setTimeout(enhancedKeyboardDetection, 300);
        }
    });

    // Click outside chat window to close
    document.addEventListener('click', (event) => {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        const chatSendButton = document.getElementById('chat-send-button');
        
        if (!chatWindow || !isChatOpen) return;

        // Kiểm tra xem click có nằm ngoài khung chat và các nút liên quan không
        const isClickInsideChat = chatWindow.contains(event.target);
        const isClickOnChatButton = chatButton && chatButton.contains(event.target);
        const isClickOnSendButton = chatSendButton && chatSendButton.contains(event.target);

        if (!isClickInsideChat && !isClickOnChatButton && !isClickOnSendButton) {
            // console.log('Click outside chat window detected, closing chat');
            
            // Ngăn chặn event bubbling để không kích hoạt các element khác
            event.preventDefault();
            event.stopPropagation();
            
            isChatOpen = false;
            chatWindow.classList.remove('active');
            chatWindow.style.display = 'none';
            removeChatOverlay();
            
            // Trả lại vị trí ban đầu nếu bàn phím đang mở
            if (isKeyboardOpen) {
                chatWindow.classList.remove('keyboard-open');
                chatWindow.style.top = 'auto';
                chatWindow.style.bottom = originalChatWindowBottom || '80px';
                chatWindow.style.height = '500px';
                isKeyboardOpen = false;
            }
            
            // Thêm một flag để ngăn chặn click tiếp theo
            document.body.classList.add('chat-just-closed');
            setTimeout(() => {
                document.body.classList.remove('chat-just-closed');
            }, 100);
        }
    });

    // Prevent chat window from closing when clicking inside it
    if (chatWindow) {
        chatWindow.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    // Add overlay when chat is open to prevent background clicks
    function addChatOverlay() {
        if (document.getElementById('chat-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'chat-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 9997;
            pointer-events: auto;
        `;
        
        overlay.addEventListener('click', (event) => {
            console.log('Overlay clicked, closing chat');
            event.preventDefault();
            event.stopPropagation();
            
            isChatOpen = false;
            chatWindow.classList.remove('active');
            chatWindow.style.display = 'none';
            
            // Remove overlay
            overlay.remove();
            
            // Trả lại vị trí ban đầu nếu bàn phím đang mở
            if (isKeyboardOpen) {
                chatWindow.classList.remove('keyboard-open');
                chatWindow.style.top = 'auto';
                chatWindow.style.bottom = originalChatWindowBottom || '80px';
                chatWindow.style.height = '500px';
                isKeyboardOpen = false;
            }
        });
        
        document.body.appendChild(overlay);
    }

    function removeChatOverlay() {
        const overlay = document.getElementById('chat-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Initialize viewport height on page load
    window.addEventListener('load', () => {
        initialViewportHeight = window.innerHeight;
        // console.log('Initial viewport height:', initialViewportHeight);
    });

    // Test function to simulate virtual keyboard opening/closing
    window.testVirtualKeyboard = function() {
        // console.log('Testing virtual keyboard simulation...');
        
        if (!isKeyboardOpen) {
            // Simulate keyboard opening
            // console.log('Simulating keyboard opening');
            const simulatedHeight = window.innerHeight - 300; // Giảm 300px để mô phỏng bàn phím mở
            
            // Temporarily override window.innerHeight
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: simulatedHeight
            });
            
            // Also override visualViewport if available
            if (window.visualViewport) {
                Object.defineProperty(window.visualViewport, 'height', {
                    writable: true,
                    configurable: true,
                    value: simulatedHeight
                });
            }
            
            // Trigger the enhanced detection
            enhancedKeyboardDetection();
            
            // Restore original values after a short delay
            setTimeout(() => {
                Object.defineProperty(window, 'innerHeight', {
                    writable: true,
                    configurable: true,
                    value: initialViewportHeight
                });
                if (window.visualViewport) {
                    Object.defineProperty(window.visualViewport, 'height', {
                        writable: true,
                        configurable: true,
                        value: initialViewportHeight
                    });
                }
            }, 100);
            
        } else {
            // Simulate keyboard closing
            // console.log('Simulating keyboard closing');
            
            // Restore original values
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: initialViewportHeight
            });
            if (window.visualViewport) {
                Object.defineProperty(window.visualViewport, 'height', {
                    writable: true,
                    configurable: true,
                    value: initialViewportHeight
                });
            }
            
            // Trigger the enhanced detection
            enhancedKeyboardDetection();
        }
        
        // Show status message
        const status = isKeyboardOpen ? 'đóng' : 'mở';
        showToastMessage(`⌨️ Đã mô phỏng bàn phím ${status}`, 'bot', 3000);
    };

    // Hàm kiểm tra và hiển thị nhắc nhở cho các món hải sản đặc biệt trong giỏ hàng (chỉ 1 lần cho tất cả)
    function checkAndShowSpecialSeafoodNotifications() {
        // console.log('Checking special seafood notifications...');
        // console.log('Cart length:', cart.length);
        // console.log('Already shown:', shownSpecialNotifications['seafood_weight']);
        
        if (cart.length === 0) {
            // console.log('Cart is empty, skipping notification check');
            return;
        }
        
        // Nếu đã nhắc rồi thì không nhắc lại
        if (shownSpecialNotifications['seafood_weight']) {
            // console.log('Seafood weight notification already shown, skipping');
            return;
        }
        
        // Kiểm tra từng món trong giỏ hàng, chỉ cần có 1 món thuộc nhóm là nhắc
        let found = false;
        cart.forEach(item => {
            const itemId = item.originalId || item.id;
            // console.log('Checking item:', itemId);
            
            for (const group of Object.values(specialSeafoodGroups)) {
                if (group.items.includes(itemId)) {
                    // console.log('Found special seafood item:', itemId, 'in group');
                    found = true;
                    break;
                }
            }
        });
        
        if (found) {
            // console.log('Triggering special seafood notification');
            showSpecialSeafoodNotification();
        } else {
            // console.log('No special seafood items found in cart');
        }
    }

    // Hàm nhắc nhở các món theo kg (chỉ hiện 1 lần mỗi phiên)
    function showSpecialSeafoodNotification() {
        // console.log('Showing special seafood notification...');
        
        // Nếu đã nhắc rồi thì không nhắc lại
        if (shownSpecialNotifications['seafood_weight']) {
            // console.log('Already shown, skipping');
            return;
        }
        
        // Skip nếu party warning đang active
        if (isPartyWarningActive) {
            console.log('Skipping special seafood notification due to party warning active');
            return;
        }
        
        // console.log('Setting notification as shown');
        shownSpecialNotifications['seafood_weight'] = true;
        
        const notice = getTranslation('seafood_weight_notice');
        // console.log('Notice text:', notice);
        
        showToastMessage(notice, 'bot', 9000);
        addMessage(notice, 'bot', false);
        
        // console.log('Special seafood notification sent successfully');
    }




    
    // Biến để theo dõi đã đề xuất bánh mì chưa
    let hasShownBreadSuggestion = false;
    
    // Function to check and suggest bread for sauce dishes
    function checkAndSuggestBread() {
        // Skip nếu party warning đang active
        if (isPartyWarningActive) {
            console.log('Skipping bread suggestion due to party warning active');
            return;
        }
        
        const sauceItems = cart.filter(item => 
            item.originalId?.includes('garlic_butter') || 
            item.originalId?.includes('tri_hang_special')
        );
        
        const breadInCart = cart.find(item => item.originalId === 'bread');
        
        if (sauceItems.length > 0 && !breadInCart && !hasShownBreadSuggestion) {
            const item = sauceItems[0];
            showBreadSuggestionToast(item);
            hasShownBreadSuggestion = true;
        }
    }
    
    // Function to show bread suggestion as two separate toasts
    function showBreadSuggestionToast(sauceItem) {
        // First message: Notification message in chat
        const notificationText = getTranslation('bread_suggestion').replace('{item_name}', getItemDisplayName(sauceItem));
        addMessage(notificationText, 'bot', false);
        
        // First toast: Notification message
        showToastMessage(notificationText, 'bot', 6000);
        
        // Second message: Bread item card in chat (after 1 second delay)
        setTimeout(() => {
            addBreadItemToChat();
        }, 1000);
        
        // Second toast: Bread item card (after 1 second delay)
        setTimeout(() => {
            showBreadItemToast();
        }, 1000);
    }
    
    // Function to show bread item toast similar to menu card
    function showBreadItemToast() {
        const breadItem = {
            id: 'bread',
            originalId: 'bread',
            price: 5000,
            quantity: 1,
            unit: '1 pcs',
            image: 'images/banhmi.jpg'
        };
        
        const toastElement = document.createElement('div');
        toastElement.className = 'toast-message bot bread-item-toast';
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        toastElement.innerHTML = `
            <button class="toast-close-button" onclick="this.parentElement.remove(); processToastQueue();">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-bread-card">
                <div class="toast-bread-image">
                    <img src="${breadItem.image}" alt="Bánh mì" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">
                </div>
                <div class="toast-bread-content">
                    <div class="toast-bread-title">${getTranslation('bread')}</div>
                    <div class="toast-bread-price">${formatDisplayPrice(breadItem.price)}đ</div>
                    <button class="toast-bread-add-btn" onclick="addBreadFromToast(this)">
                        ${getTranslation('add_to_cart_short')}
                    </button>
                </div>
            </div>
            <div class="toast-message-time">${time}</div>
            <div class="toast-progress" style="animation-duration: 8000ms;"></div>
        `;
        
        toastContainer.appendChild(toastElement);
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 100);
        
        // Auto hide after 8 seconds
        setTimeout(() => {
            const progress = toastElement.querySelector('.toast-progress');
            if (progress) {
                progress.classList.add('hide');
            }
            toastElement.classList.add('hide');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                processToastQueue();
            }, 100);
        }, 8000);
    }
    
    // Function to add bread item card to chat
    function addBreadItemToChat() {
        const breadItem = {
            id: 'bread',
            originalId: 'bread',
            price: 5000,
            quantity: 1,
            unit: '1 pcs',
            image: 'images/banhmi.jpg'
        };
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="message-text">
                    <div class="chat-bread-card">
                        <div class="chat-bread-image">
                            <img src="${breadItem.image}" alt="Bánh mì" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">
                        </div>
                        <div class="chat-bread-content">
                            <div class="chat-bread-title">${getTranslation('bread')}</div>
                            <div class="chat-bread-price">${formatDisplayPrice(breadItem.price)}đ</div>
                            <button class="chat-bread-add-btn" onclick="addBreadFromChat(this)">
                                ${getTranslation('add_to_cart_short')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="message-time">${time}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in history
        chatHistory.push({ 
            text: `[Bread Item Card]`, 
            sender: 'bot', 
            time: new Date() 
        });
    }
    
    // Function to add bread to cart from chat
    window.addBreadToCart = function() {
        const breadItem = {
            id: 'bread',
            originalId: 'bread',
            price: 5000,
            quantity: 1,
            unit: '1 pcs',
            image: 'images/banhmi.jpg'
        };
        
        addToCart(breadItem);
        
        // Add message to chat
        addMessage(getTranslation('bread_added_message'), 'bot');
        
        // Show confirmation toast
        showToastMessage(getTranslation('bread_added_confirmation'), 'bot', 5000);
    };
    
    // Function to add bread from toast button
    window.addBreadFromToast = function(button) {
        const toastElement = button.closest('.toast-message');
        
        // Add bread to cart
        const breadItem = {
            id: 'bread',
            originalId: 'bread',
            price: 5000,
            quantity: 1,
            unit: '1 pcs',
            image: 'images/banhmi.jpg'
        };
        
        addToCart(breadItem);
        
        // Close the suggestion toast
        if (toastElement) {
            const progress = toastElement.querySelector('.toast-progress');
            if (progress) {
                progress.classList.add('hide');
            }
            toastElement.classList.add('hide');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                processToastQueue();
            }, 100);
        }
    };
    
    // Function to add bread from chat button
    window.addBreadFromChat = function(button) {
        // Add bread to cart
        const breadItem = {
            id: 'bread',
            originalId: 'bread',
            price: 5000,
            quantity: 1,
            unit: '1 pcs',
            image: 'images/banhmi.jpg'
        };
        
        addToCart(breadItem);
        
        // Disable the button to prevent multiple clicks
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = '#28a745';
    };
    

    
    // Function to check if party size trigger should be activated
    function checkPartySizeTrigger() {
        console.log('checkPartySizeTrigger called');
        console.log('Current state:', {
            hasAskedPartySize,
            partySizeAsked,
            selectedPartySize,
            hasShownLargePartyWarning,
            cartLength: cart.length
        });
        
        // Reset flags if cart is empty
        if (cart.length === 0) {
            hasAskedPartySize = false;
            partySizeAsked = false;
            selectedPartySize = null;
            hasShownLargePartyWarning = false;
            console.log('Cart empty, resetting flags');
            return;
        }
        
        // Auto-reset flags if we have 8+ items but flags are still set
        const nonDrinkItemsForReset = cart.filter(item => {
            const category = getItemCategory(item.id);
            return category !== 'drinks' && category !== 'other';
        });
        
        if (nonDrinkItemsForReset.length >= 8 && (hasAskedPartySize || partySizeAsked)) {
            console.log('8+ items detected but flags are set, auto-resetting flags');
            hasAskedPartySize = false;
            partySizeAsked = false;
            selectedPartySize = null;
            hasShownLargePartyWarning = false;
        }
        
        // Check if user has main dishes (excluding drinks and other)
        const nonDrinkItems = cart.filter(item => {
            const category = getItemCategory(item.id);
            return category !== 'drinks' && category !== 'other';
        });
        
        if (hasAskedPartySize || partySizeAsked) {
            console.log('Party size already asked, skipping trigger');
            return;
        }
        

        
        console.log(`Party size trigger check: ${nonDrinkItemsForReset.length} main dishes, hasAskedPartySize: ${hasAskedPartySize}, hasShownLargePartyWarning: ${hasShownLargePartyWarning}`);
        console.log('Cart items:', cart.map(item => ({ id: item.id, category: getItemCategory(item.id) })));
        console.log('Non-drink items:', nonDrinkItemsForReset.map(item => ({ id: item.id, category: getItemCategory(item.id) })));
        
        // Trigger for 8+ main dishes - skip party size question and show warning directly
        if (nonDrinkItemsForReset.length >= 8 && !hasShownLargePartyWarning) {
            console.log('8+ main dishes detected - showing warning directly');
            hasAskedPartySize = true;
            partySizeAsked = true;
            selectedPartySize = '8+';
            hasShownLargePartyWarning = true;
            
            // Show warning modal directly without asking party size
            setTimeout(() => {
                showPartyWarningModal();
            }, 1000); // 1 second delay
        }
        // Trigger for 6-7 main dishes - ask party size question
        else if (nonDrinkItemsForReset.length >= 6) {
            console.log('6-7 main dishes detected - asking party size');
            // Add delay before asking party size (1-2 seconds)
            setTimeout(() => {
                if (!hasAskedPartySize && !partySizeAsked) {
                    askPartySize();
                }
            }, 1500); // 1.5 second delay
        }
    }
    

    
    // Function to get item category
    function getItemCategory(itemId) {
        // This function should return the category of an item
        // For now, we'll use a simple mapping
        const categoryMapping = {
            'bread': 'other',
            'larue_smooth': 'drinks',
            'tiger_crystal': 'drinks',
            'heineken': 'drinks',
            'coca_cola': 'drinks',
            'sprite': 'drinks',
            'fanta': 'drinks',
            'dasani_water': 'drinks',
            'huda': 'drinks',
            'red_bull': 'drinks',
            'sparkling_mineral_water': 'drinks',
            'cold_napkin': 'other'
        };
        
        return categoryMapping[itemId] || 'main_course';
    }
    

    
    // Function to ask party size
    function askPartySize() {
        if (hasAskedPartySize) return;
        
        hasAskedPartySize = true;
        partySizeAsked = true;
        
        // Create persistent toast with party size question
        const toastElement = document.createElement('div');
        toastElement.className = 'toast-message bot party-size-question';
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        
        toastElement.innerHTML = `
            <div class="toast-message-content">
                <i class="fas fa-robot"></i>
                <div class="toast-message-text">
                    ${getTranslation('ask_party_size')}
                </div>
            </div>
            <div class="toast-party-size-question-options">
                <button class="toast-party-size-question-btn" onclick="selectPartySize('1-3')">
                    ${getTranslation('party_size_1_3')}
                </button>
                <button class="toast-party-size-question-btn" onclick="selectPartySize('4-7')">
                    ${getTranslation('party_size_4_7')}
                </button>
                <button class="toast-party-size-question-btn" onclick="selectPartySize('8+')">
                    ${getTranslation('party_size_8_plus')}
                </button>
            </div>
            <div class="toast-message-time">${time}</div>
        `;
        
        toastContainer.appendChild(toastElement);
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 100);
        
        // Store in history
        chatHistory.push({ 
            text: `[Party Size Question]`, 
            sender: 'bot', 
            time: new Date() 
        });
    }
    
    // Function to handle party size selection
    window.selectPartySize = function(size) {
        selectedPartySize = size;
        let recommendations = [];
        
        // Remove the persistent toast
        const partySizeToast = document.querySelector('.party-size-question');
        if (partySizeToast) {
            partySizeToast.classList.add('hide');
            setTimeout(() => {
                if (partySizeToast.parentNode) {
                    partySizeToast.parentNode.removeChild(partySizeToast);
                }
                processToastQueue();
            }, 300);
        }
        
        if (size === '4-7' || size === '8+') {
            // Show warning modal instead of simple toast
            showPartyWarningModal();
        }
        
        // Store in history
        chatHistory.push({ 
            text: `[Party Size Selected: ${size}]`, 
            sender: 'user', 
            time: new Date() 
        });
    };
    
    // Function to show party warning modal
    function showPartyWarningModal() {
        const modal = document.getElementById('party-warning-modal');
        const title = document.getElementById('party-warning-title');
        const subtitle = document.getElementById('party-warning-subtitle');
        const message = document.getElementById('party-warning-message');
        const button = document.getElementById('party-warning-btn');
        
        console.log('showPartyWarningModal called');
        console.log('Modal elements:', { modal, title, subtitle, message, button });
        console.log('Current translations object:', translations);
        console.log('Current language:', currentLang);
        
        // Đảm bảo translations đã được load
        if (!translations || Object.keys(translations).length === 0) {
            console.log('Translations not loaded yet, loading...');
            loadTranslations().then(() => {
                showPartyWarningModal(); // Gọi lại sau khi load xong
            });
            return;
        }
        
        // Debug: Kiểm tra translations
        console.log('Current translations:', translations);
        console.log('Party warning title translation:', translations?.bot_responses?.party_warning_title?.[currentLang]);
        console.log('Party warning subtitle translation:', translations?.bot_responses?.party_warning_subtitle?.[currentLang]);
        console.log('Party warning message translation:', translations?.bot_responses?.party_warning_message?.[currentLang]);
        console.log('Party warning continue translation:', translations?.bot_responses?.party_warning_continue?.[currentLang]);
        
        // Cập nhật nội dung theo ngôn ngữ hiện tại với fallback
        const titleText = translations?.bot_responses?.party_warning_title?.[currentLang] || 
                         translations?.bot_responses?.party_warning_title?.['en'] || 
                         'Cảnh Báo Đặt Món';
        const subtitleText = translations?.bot_responses?.party_warning_subtitle?.[currentLang] || 
                            translations?.bot_responses?.party_warning_subtitle?.['en'] || 
                            'Nhóm đông người';
        const messageText = translations?.bot_responses?.party_warning_message?.[currentLang] || 
                           translations?.bot_responses?.party_warning_message?.['en'] || 
                           '<strong>Lưu ý quan trọng:</strong><br><br>Khi đặt nhiều món riêng lẻ cho nhóm đông người, thời gian chờ có thể kéo dài từ <strong>30\' ~1h+</strong> do mỗi món cần quy trình chế biến khác nhau.<br><br><strong>Đặc biệt trong giờ cao điểm:</strong> Bếp sẽ ưu tiên nấu các món có số lượng nhiều cùng loại để đảm bảo tốc độ phục vụ nhanh nhất.<br><br><strong>Khuyến nghị:</strong> Chọn các món cùng loại để được phục vụ nhanh hơn và có trải nghiệm ăn uống tốt hơn.';
        const buttonText = translations?.bot_responses?.party_warning_continue?.[currentLang] || 
                          translations?.bot_responses?.party_warning_continue?.['en'] || 
                          'Tiếp tục';
    
    console.log('Final texts:', { titleText, subtitleText, messageText, buttonText });
    
    title.textContent = titleText;
    subtitle.textContent = subtitleText;
    message.innerHTML = messageText;
    button.textContent = buttonText;
    
    modal.style.display = 'flex';
    document.body.classList.add('party-warning-locked');
    
    // Set party warning active flag
    isPartyWarningActive = true;
    
    // Khóa nút "Tiếp tục" trong 6 giây để ép người dùng đọc thông tin
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
    
    // Hiển thị countdown trên nút
    let countdown = 6;
    const originalButtonText = buttonText;
    button.textContent = `${originalButtonText} (${countdown}s)`;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            button.textContent = `${originalButtonText} (${countdown}s)`;
        } else {
            // Mở khóa nút sau 6 giây
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.textContent = originalButtonText;
            clearInterval(countdownInterval);
            document.body.classList.remove('party-warning-locked');
        }
    }, 1000);
}
    
    // Function to handle party warning confirmation
    window.confirmPartyWarning = function() {
        const modal = document.getElementById('party-warning-modal');
        const buttons = modal.querySelectorAll('.party-warning-btn');
        
        // Disable buttons immediately
        buttons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Tạm thời tắt tất cả toast để tránh spam
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = '';
        }
        
        // Reset party warning flags
        isPartyWarningActive = false;
        hasShownLargePartyWarning = false;
        
        // Hide modal after short delay
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('party-warning-locked');
            
            // Mở khung chat nếu chưa mở
            if (!chatWindow.classList.contains('active')) {
                chatWindow.classList.add('active');
                chatWindow.style.display = 'flex';
            }
            
            // Always show optimization message (không hiển thị toast cho message này)
            const optimizationMessage = translations?.bot_responses?.large_party_optimization?.[currentLang] || 
                                     translations?.bot_responses?.large_party_optimization?.['en'] || 
                                     '🍽️ <strong>IMPORTANT WARNING:</strong><br><br>For groups of 4+ people, ordering multiple separate dishes can result in extended wait times of <strong>30\' ~1h+</strong> because each dish requires different preparation processes.<br><br><strong>Especially during peak hours:</strong> The kitchen prioritizes cooking dishes with large quantities of the same type to ensure the fastest service speed.<br><br><strong>Recommendation:</strong> Choose dishes of the same type to be served faster and have a better dining experience.';
            
            // Thêm message vào chat mà không trigger toast
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <i class="fas fa-robot"></i>
                    <div class="message-text">${optimizationMessage}</div>
                </div>
                <div class="message-time">Bây giờ</div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Store in history mà không trigger toast
            chatHistory.push({ text: optimizationMessage, sender: 'bot', time: new Date() });
            
            // Get and show recommendations
            const recommendations = getDishRecommendations(8);
            setTimeout(() => {
                showDishRecommendationsInChat(recommendations);
                // Scroll chat xuống cuối để thấy tin nhắn mới
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1500);
            
            // Store in history
            chatHistory.push({ 
                text: `[Party Warning: confirmed]`, 
                sender: 'user', 
                time: new Date() 
            });
        }, 300);
    };
    
    // Function to get dish recommendations
    function getDishRecommendations(max = 4) {
        // Get items from customer's cart that have quantity = 1 (excluding per-kg, drinks, and other items)
        const cartRecommendations = cart.filter(item => {
            // Exclude per-kg items
            if (item.priceType === 'per_kg') {
                return false;
            }
            
            // Exclude drinks and other categories
            const category = getItemCategory(item.originalId || item.id);
            if (category === 'drinks' || category === 'other') {
                return false;
            }
            
            // Only include items with quantity = 1
            if (item.quantity === 1) {
                return true;
            }
            return false;
        }).map(item => {
            // Create recommendation object from cart item
            let minQuantity = 1; // Default suggest next quantity (1)
            
            // Nếu party size là 8+ thì đề xuất thêm 2
            if (selectedPartySize === '8+') {
                minQuantity = 2; // Thêm 2 cho hơn 8 người
            } else {
                minQuantity = 1; // Thêm 1 cho các party size khác
            }
            
            return {
                id: item.originalId || item.id,
                name: getItemDisplayName(item),
                price: item.price,
                image: item.image,
                currentQuantity: item.quantity,
                priceType: item.priceType,
                unit: item.unit,
                minQuantity: minQuantity
            };
        });
        
        // Return up to max recommendations
        return cartRecommendations.slice(0, max);
    }
    
    // Function to show dish recommendations in chat
    function showDishRecommendationsInChat(recommendations) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        let dishGridHTML = '<div class="chat-dish-grid">';
        recommendations.forEach(dish => {
            // Xác định text cho nút thêm dựa trên party size
            let addButtonText = getTranslation('add_to_cart_short');
            if (selectedPartySize === '8+') {
                addButtonText = 'Thêm 2';
            } else {
                addButtonText = getTranslation('add_to_cart_short');
            }
            
            dishGridHTML += `
                <div class="chat-dish-card">
                    <div class="chat-dish-image">
                        <img src="${dish.image}" alt="${dish.name}" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">
                    </div>
                    <div class="chat-dish-content">
                        <div class="chat-dish-title">${dish.name}</div>
                        <div class="chat-dish-price">${formatDisplayPrice(dish.price)}đ</div>
                        <div class="chat-dish-unit">${dish.unit || '1 pcs'}</div>
                        <button class="chat-dish-add-btn" onclick="addRecommendedDishWithQuantity('${dish.id}', this)">
                            ${addButtonText}
                        </button>
                    </div>
                </div>
            `;
        });
        dishGridHTML += '</div>';

        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="message-text">
                    ${dishGridHTML}
                </div>
            </div>
            <div class="message-time">${time}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in history
        chatHistory.push({ 
            text: `[Dish Recommendations]`, 
            sender: 'bot', 
            time: new Date() 
        });
    }
    
    // Function to show dish recommendations in toast with delay
    function showDishRecommendationsInToast(recommendations) {
        // Add delay before showing recommendations toast
        setTimeout(() => {
            const toastElement = document.createElement('div');
            toastElement.className = 'toast-message bot dish-recommendations-toast';
            const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            
            let dishGridHTML = '<div class="toast-dish-grid">';
            recommendations.forEach(dish => {
                // Xác định text cho nút thêm dựa trên party size
                let addButtonText = getTranslation('add_to_cart_short');
                if (selectedPartySize === '8+') {
                    addButtonText = 'Thêm 2'; // Hiển thị "Thêm 2" cho hơn 8 người
                } else {
                    addButtonText = getTranslation('add_to_cart_short'); // Hiển thị "Thêm" cho các party size khác
                }
                
                dishGridHTML += `
                    <div class="toast-dish-card">
                        <div class="toast-dish-image">
                            <img src="${dish.image}" alt="${dish.name}" onerror="this.parentElement.innerHTML='<span class=\\'no-image\\'>No image</span>'">
                        </div>
                        <div class="toast-dish-content">
                            <div class="toast-dish-title">${dish.name}</div>
                            <div class="toast-dish-price">${formatDisplayPrice(dish.price)}đ</div>
                            <div class="toast-dish-unit">${dish.unit || '1 pcs'}</div>
                            <button class="toast-dish-add-btn" onclick="addRecommendedDishWithQuantity('${dish.id}', this)">
                                ${addButtonText}
                            </button>
                        </div>
                    </div>
                `;
            });
            dishGridHTML += '</div>';
            
            toastElement.innerHTML = `
                <button class="toast-close-button" onclick="this.parentElement.remove(); processToastQueue();">
                    <i class="fas fa-times"></i>
                </button>
                ${dishGridHTML}
                <div class="toast-message-time">${time}</div>
                <div class="toast-progress" style="animation-duration: 8000ms;"></div>
            `;
            
            toastContainer.appendChild(toastElement);
            setTimeout(() => {
                toastElement.classList.add('show');
            }, 100);
            
            // Auto hide after 8 seconds
            setTimeout(() => {
                const progress = toastElement.querySelector('.toast-progress');
                if (progress) {
                    progress.classList.add('hide');
                }
                toastElement.classList.add('hide');
                setTimeout(() => {
                    if (toastElement.parentNode) {
                        toastElement.parentNode.removeChild(toastElement);
                    }
                    processToastQueue();
                }, 100);
            }, 8000);
        }, 2000); // 2 second delay
    }
    
    // Function to change recommended dish quantity
    window.changeRecommendedQuantity = function(dishId, change, button) {
        const quantityDisplay = document.querySelector(`[data-dish-id="${dishId}"].chat-dish-quantity-display, [data-dish-id="${dishId}"].toast-dish-quantity-display`);
        if (quantityDisplay) {
            let currentQuantity = parseInt(quantityDisplay.textContent);
            let newQuantity = currentQuantity + change;
            
            // Ensure quantity doesn't go below 1
            if (newQuantity < 1) {
                newQuantity = 1;
            }
            
            // Ensure quantity doesn't go above 10
            if (newQuantity > 10) {
                newQuantity = 10;
            }
            
            quantityDisplay.textContent = newQuantity;
        }
    };
    
    // Function to add recommended dish with quantity
    window.addRecommendedDishWithQuantity = function(dishId, button, quantity = null) {
        // Find dish in menuData structure
        let dish = null;
        for (const category of menuData.menu) {
            dish = category.items.find(item => item.id === dishId);
            if (dish) break;
        }
        
        if (!dish) {
            console.error('Dish not found:', dishId);
            return;
        }
        
        // Xác định quantity dựa trên party size
        if (!quantity || quantity < 1) {
            if (selectedPartySize === '8+') {
                quantity = 2; // Thêm 2 cho hơn 8 người
            } else {
                quantity = 1; // Thêm 1 cho các party size khác
            }
        }
        
        // Add to cart
        addToCart(dish, quantity);
        
        // Show success message - REMOVED
        // showToastMessage('✅ Món đã được thêm vào giỏ hàng!', 'bot');
        
        // Disable button and change text - SYNC ALL BUTTONS WITH SAME DISH ID
        const allButtons = document.querySelectorAll(`button[onclick*="addRecommendedDishWithQuantity('${dishId}'"]`);
        allButtons.forEach(btn => {
            btn.disabled = true;
            if (selectedPartySize === '8+') {
                btn.textContent = 'Đã thêm 2';
            } else {
                btn.textContent = 'Đã thêm';
            }
            btn.style.background = '#28a745';
        });
    };
    
    // Price Quote Functions
    function openPriceQuoteModal(item, cartIndex = -1) {
        currentQuoteItem = item;
        currentQuoteCartIndex = cartIndex;
        
        // Set title
        priceQuoteTitle.textContent = getItemDisplayName(item);
        
        // Clear input
        gramInput.value = '';
        
        // Show modal
        priceQuoteModal.style.display = 'flex';
    }
    
    // Function to open price quote modal from cart
    window.openPriceQuoteModalFromCart = function(itemId, cartIndex) {
        const item = cart[cartIndex];
        if (item) {
            openPriceQuoteModal(item, cartIndex);
        }
    }
    
    function closePriceQuoteModal() {
        priceQuoteModal.style.display = 'none';
        currentQuoteItem = null;
        currentQuoteCartIndex = -1;
        gramInput.value = '';
        
        // Reset modal state
        document.querySelector('.gram-input-section').style.display = 'block';
        document.querySelector('.action-buttons').style.display = 'flex';
        document.getElementById('quote-result').style.display = 'none';
    }
    
    // Global functions for number input
    window.addNumber = function(num) {
        gramInput.value = gramInput.value.replace(/^0+/, '') + num;
    }
    
    window.clearGramInput = function() {
        gramInput.value = '';
    }
    
    // Quote price function
    function quotePrice() {
        const grams = parseInt(gramInput.value) || 0;
        if (grams === 0) return;
        
        if (!currentQuoteItem) return;
        
        let price = 0;
        let itemName = '';
        
        if (currentQuoteItem.priceType === 'per_kg') {
            price = calculatePerKgPrice(grams, currentQuoteItem.pricePerKg);
            itemName = getItemDisplayName(currentQuoteItem);
        } else {
            price = currentQuoteItem.price * grams;
            itemName = getItemDisplayName(currentQuoteItem);
        }
        
        // Update cart item gram value if it's from cart
        if (currentQuoteCartIndex >= 0 && currentQuoteCartIndex < cart.length) {
            cart[currentQuoteCartIndex].weightGram = grams;
            cart[currentQuoteCartIndex].price = price;
            cart[currentQuoteCartIndex].unit = `${grams}g`;
            
            // Update cart display
            updateCartDisplay(true);
            renderCartItems();
        }
        
        // Show result in modal
        const quoteResult = document.getElementById('quote-result');
        const quoteResultContent = document.getElementById('quote-result-content');
        
        let pricePerKgDisplay = '';
        if (currentQuoteItem.priceType === 'per_kg') {
            pricePerKgDisplay = `<div class="price-per-kg">Giá: ${formatDisplayPrice(currentQuoteItem.pricePerKg)}đ/kg</div>`;
        }
        
        quoteResultContent.innerHTML = `
            ${pricePerKgDisplay}
            <div class="quote-price-display">
                ${grams}g ${itemName}: ${formatDisplayPrice(price)} VND
            </div>
        `;
        
        // Hide input section and show result
        document.querySelector('.gram-input-section').style.display = 'none';
        document.querySelector('.action-buttons').style.display = 'none';
        quoteResult.style.display = 'block';
    }
    
    // Update weight function
    function updateWeight() {
        const grams = parseInt(gramInput.value) || 0;
        if (grams === 0) return;
        
        if (currentQuoteCartIndex >= 0 && currentQuoteCartIndex < cart.length) {
            // Update existing cart item
            cart[currentQuoteCartIndex].weightGram = grams;
            cart[currentQuoteCartIndex].price = calculatePerKgPrice(grams, cart[currentQuoteCartIndex].pricePerKg);
            cart[currentQuoteCartIndex].unit = `${grams}g`;
            
            // Update cart display
            updateCartDisplay(true);
            renderCartItems();
        }
        
        // Close modal
        closePriceQuoteModal();
    }
    
    // Event listeners for price quote modal
    if (priceQuoteClose) {
        priceQuoteClose.addEventListener('click', closePriceQuoteModal);
    }
    
    if (quotePriceBtn) {
        quotePriceBtn.addEventListener('click', quotePrice);
    }
    
    if (updateWeightBtn) {
        updateWeightBtn.addEventListener('click', updateWeight);
    }
    
    // Close quote result
    const closeQuoteResultBtn = document.getElementById('close-quote-result');
    if (closeQuoteResultBtn) {
        closeQuoteResultBtn.addEventListener('click', closePriceQuoteModal);
    }
    
    // Close modal when clicking outside
    if (priceQuoteModal) {
        priceQuoteModal.addEventListener('click', (e) => {
            if (e.target === priceQuoteModal) {
                closePriceQuoteModal();
            }
        });
    }

    // Chat Dropdown Functionality
    const chatDropdownBtn = document.getElementById('chat-dropdown-btn');
    const chatDropdownMenu = document.getElementById('chat-dropdown-menu');
    
    // Toggle dropdown menu
    if (chatDropdownBtn && chatDropdownMenu) {
        chatDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!chatDropdownBtn.contains(e.target) && !chatDropdownMenu.contains(e.target)) {
                chatDropdownMenu.classList.remove('show');
            }
        });
        
        // Handle dropdown item clicks
        const dropdownItems = chatDropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                const question = item.getAttribute('data-question');
                handleAutoQuestion(question);
                chatDropdownMenu.classList.remove('show');
            });
        });
    }
    
    // Function to update dropdown items based on current language
    function updateDropdownItems() {
        const dropdownItems = document.querySelectorAll('.dropdown-item span');
        dropdownItems.forEach(item => {
            if (item.textContent === 'Giờ mở cửa') {
                item.textContent = getTranslation('hours_info', currentLang);
            }
        });
    }
    
    // Function to handle auto questions
    function handleAutoQuestion(question) {
        let message = '';
        let response = '';
        
        switch (question) {
            case 'opening_hours':
                message = getTranslation('hours_info', currentLang);
                response = getTranslation('hours_response', currentLang);
                break;
            default:
                return;
        }
        
        // Add user message
        addMessage(message, 'user');
        
        // Add bot response
        setTimeout(() => {
            addMessage(response, 'bot');
        }, 500);
    }

    // Menu Server Integration - Chỉ dành cho nhân viên quán
    const MENU_SERVER_URL = 'http://192.168.110.210:5000';
    
    // Tạo nút Gửi Menu nếu chưa có
    function createSendMenuButton() {
        let sendMenuBtn = document.getElementById('send-menu-btn');
        
        if (!sendMenuBtn) {
            console.log('Tạo nút Gửi Menu...');
            sendMenuBtn = document.createElement('button');
            sendMenuBtn.id = 'send-menu-btn';
            sendMenuBtn.className = 'send-menu-btn';
            sendMenuBtn.innerHTML = '📤 Gửi Menu';
            sendMenuBtn.title = 'Gửi menu đến bếp (Chỉ dành cho nhân viên)';
            sendMenuBtn.style.display = 'none';
            sendMenuBtn.addEventListener('click', sendMenuToServer);
            
            // Thêm vào cart-total
            const cartTotal = document.getElementById('cart-total');
            if (cartTotal) {
                cartTotal.appendChild(sendMenuBtn);
                console.log('✅ Đã tạo và thêm nút Gửi Menu');
            } else {
                console.log('❌ Không tìm thấy cart-total element');
            }
        }
        
        return sendMenuBtn;
    }
    
    // Check if menu server is available and user is on restaurant WiFi
    async function checkMenuServerStatus() {
        try {
            const response = await fetch(`${MENU_SERVER_URL}/health`);
            const data = await response.json();
            return data.status === 'healthy';
        } catch (error) {
            console.log('Menu server not available:', error);
            return false;
        }
    }
    
    // Check if user is on restaurant WiFi (LAN network)
    function isOnRestaurantWiFi() {
        // Kiểm tra IP address có phải là LAN của quán không
        // 192.168.110.x là mạng LAN của quán
        const hostname = window.location.hostname;
        const isLocalNetwork = hostname === '192.168.110.210' || 
                              hostname === 'localhost' ||
                              hostname === '127.0.0.1' ||
                              hostname.includes('192.168.110.');
        
        // Thêm kiểm tra URL có chứa IP quán không
        const url = window.location.href;
        const isRestaurantURL = url.includes('192.168.110.210') || 
                               url.includes('localhost') ||
                               url.includes('127.0.0.1');
        
        console.log('Network check:', {
            hostname: hostname,
            url: url,
            isLocalNetwork: isLocalNetwork,
            isRestaurantURL: isRestaurantURL
        });
        
        return isLocalNetwork || isRestaurantURL;
    }
    
    // Show/hide send menu button based on server status and WiFi
    async function updateSendMenuButton() {
        const isServerAvailable = await checkMenuServerStatus();
        const isOnRestaurantNetwork = isOnRestaurantWiFi();
        
        // Debug info cho nhân viên
        console.log('Send Menu Button Status:', {
            isServerAvailable: isServerAvailable,
            isOnRestaurantNetwork: isOnRestaurantNetwork,
            cartLength: cart.length,
            shouldShow: isServerAvailable && cart.length > 0 && isOnRestaurantNetwork
        });
        
        // Tạo hoặc lấy nút Gửi Menu
        const button = createSendMenuButton();
        console.log('Send Menu Button Element:', button);
        
        if (button) {
            if (isServerAvailable && cart.length > 0 && isOnRestaurantNetwork) {
                button.style.display = 'flex';
                button.disabled = false;
                console.log('✅ Nút Gửi Menu đã được hiển thị');
            } else {
                button.style.display = 'none';
                button.disabled = true;
                
                // Debug info
                if (!isServerAvailable) {
                    console.log('❌ Server không khả dụng');
                }
                if (cart.length === 0) {
                    console.log('❌ Giỏ hàng trống');
                }
                if (!isOnRestaurantNetwork) {
                    console.log('❌ Không kết nối WiFi quán');
                }
            }
        } else {
            console.log('❌ Không thể tạo nút Gửi Menu');
        }
    }
    
    // Send menu to server - Chỉ dành cho nhân viên
    async function sendMenuToServer() {
        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }
        
        // Kiểm tra lại xem có đang ở mạng quán không
        if (!isOnRestaurantWiFi()) {
            alert('❌ Chỉ có thể gửi menu khi kết nối WiFi quán!');
            return;
        }
        
        // Prompt for secret code
        const secretCode = prompt('Nhập mật mã xác nhận:');
        if (!secretCode) {
            alert('Vui lòng nhập mật mã!');
            return;
        }
        
        try {
            // Prepare cart data
            const cartData = cart.map(item => ({
                name: getItemDisplayName(item),
                price: item.priceType === 'per_kg' ? 
                    (item.weightGram ? calculatePerKgPrice(item.weightGram, item.pricePerKg) : 0) : 
                    getNumericPrice(item.price),
                quantity: item.quantity,
                unit: item.unit || 'PCS',
                spicyLevel: item.spicyLevel || 'none'
            }));
            
            const response = await fetch(`${MENU_SERVER_URL}/api/send-menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    secret_code: secretCode,
                    cart_data: cartData
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('✅ Menu đã được gửi thành công!');
                console.log('Menu sent successfully:', result);
            } else {
                alert(`❌ Lỗi: ${result.message}`);
                console.error('Menu send error:', result);
            }
        } catch (error) {
            alert('❌ Không thể kết nối đến server');
            console.error('Menu send error:', error);
        }
    }
    
    // Tạo nút Gửi Menu khi trang load
    setTimeout(() => {
        createSendMenuButton();
    }, 1000);
    
    // Update send menu button when cart changes
    const originalUpdateCartDisplay = updateCartDisplay;
    updateCartDisplay = function(animate = false) {
        originalUpdateCartDisplay(animate);
        updateSendMenuButton();
    };
    
    // Check server status on page load
    setTimeout(() => {
        updateSendMenuButton();
    }, 2000);
    
    // Tạo nút Gửi Menu khi trang load
    setTimeout(() => {
        createSendMenuButton();
        console.log('🔄 Đã tạo nút Gửi Menu');
    }, 1000);

    // Load translations and initialize the app
    console.log('Starting to load translations...');
    loadTranslations().then(() => {
        console.log('Translations loaded successfully in main initialization');
    }).catch((error) => {
        console.error('Error loading translations in main initialization:', error);
    });

}); 