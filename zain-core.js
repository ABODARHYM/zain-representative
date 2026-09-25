// ================================================================
// 🚚 ZAIN CORE - توصيل زين
// ================================================================
// النظام الموحد المتكامل v10.0.0
// التاريخ: 2026-09-23
// 
// ✅ محسّن للأداء
// ✅ إشعارات ذكية
// ✅ listenForNewNotifications محسّن
// ================================================================

(function() {
    'use strict';

    // ================================================================
    // 1. Firebase Configuration
    // ================================================================
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyBDwnZz-uV5PVrsUAGio_9OtFKI_h8oczA",
        authDomain: "haven-stores.firebaseapp.com",
        projectId: "haven-stores",
        storageBucket: "haven-stores.firebasestorage.app",
        messagingSenderId: "638009290396",
        appId: "1:638009290396:web:dc5963f171b87104ab0759",
        measurementId: "G-HJ09HG3B6N"
    };

    // ================================================================
    // 2. Initialize Firebase
    // ================================================================
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }

    const db = firebase.firestore();
    const auth = firebase.auth();
    let storage = null;
    try {
        if (firebase.storage && typeof firebase.storage === 'function') {
            storage = firebase.storage();
        }
    } catch (e) {
        console.warn('Firebase Storage غير متوفر');
    }

    // ================================================================
    // 3. روابط التطبيقات الأربعة
    // ================================================================
    const APPS_URLS = {
        admin: {
            local: '../zain-admin/',
            online: '/zain-admin/',
            loginPage: 'login.html',
            homePage: 'admin.html',
            name: 'تطبيق الإدارة',
            icon: '👑'
        },
        store: {
            local: '../zain-store/',
            online: '/zain-store/',
            loginPage: 'login.html',
            homePage: 'stores.html',
            name: 'تطبيق المتجر',
            icon: '🏪'
        },
        driver: {
            local: '../zain-driver/',
            online: '/zain-driver/',
            loginPage: 'login.html',
            homePage: 'drivers.html',
            name: 'تطبيق المندوب',
            icon: '🛵'
        },
        customer: {
            local: '../zain-app/',
            online: '/zain-app/',
            loginPage: 'login.html',
            homePage: 'customer.html',
            name: 'تطبيق العملاء',
            icon: '👤'
        }
    };

    // ================================================================
    // 4. كشف التطبيق الحالي تلقائياً
    // ================================================================
    function detectCurrentApp() {
        const path = window.location.pathname;
        const href = window.location.href;
        
        if (path.indexOf('zain-admin') !== -1 || href.indexOf('zain-admin') !== -1) return 'admin';
        if (path.indexOf('zain-store') !== -1 || href.indexOf('zain-store') !== -1) return 'store';
        if (path.indexOf('zain-driver') !== -1 || href.indexOf('zain-driver') !== -1) return 'driver';
        if (path.indexOf('zain-app') !== -1 || href.indexOf('zain-app') !== -1) return 'customer';
        
        return 'customer';
    }

    const CURRENT_APP = detectCurrentApp();

    // ================================================================
    // 5. Role Definitions
    // ================================================================
    const ROLES = {
        SUPER_ADMIN: 'super_admin',
        STORE_OWNER: 'store_owner',
        DRIVER: 'driver',
        CUSTOMER: 'customer',
        GUEST: 'guest'
    };

    const ROLE_CONFIG = {
        super_admin: {
            name: 'المالك العام',
            nameEn: 'Super Admin',
            icon: '👑',
            color: '#D4AF37',
            gradient: 'linear-gradient(135deg, #D4AF37, #F4D03F)',
            homePage: 'admin.html',
            appType: 'admin',
            description: 'إدارة كاملة للمنصة'
        },
        store_owner: {
            name: 'مالك متجر',
            nameEn: 'Store Owner',
            icon: '🏪',
            color: '#3498db',
            gradient: 'linear-gradient(135deg, #3498db, #5dade2)',
            homePage: 'stores.html',
            appType: 'store',
            description: 'إدارة متجرك والطلبات'
        },
        driver: {
            name: 'مندوب توصيل',
            nameEn: 'Driver',
            icon: '🛵',
            color: '#e67e22',
            gradient: 'linear-gradient(135deg, #e67e22, #f39c12)',
            homePage: 'drivers.html',
            appType: 'driver',
            description: 'استلام وتوصيل الطلبات'
        },
        customer: {
            name: 'عميل',
            nameEn: 'Customer',
            icon: '👤',
            color: '#2C5F2D',
            gradient: 'linear-gradient(135deg, #2C5F2D, #6A7F3A)',
            homePage: 'customer.html',
            appType: 'customer',
            description: 'اطلب من المتاجر'
        }
    };

    // ================================================================
    // 6. Brand - الهوية البصرية
    // ================================================================
    const BRAND = {
        name: 'توصيل زين',
        nameEn: 'ZAIN DELIVERY',
        icon: '🚚',
        tagline: 'التوصيل المميز',
        taglineEn: 'Premium Delivery',
        colors: {
            primary: '#2C5F2D',
            primaryLight: '#6A7F3A',
            primaryLighter: '#8FAA5C',
            gold: '#D4AF37',
            goldLight: '#F4D03F',
            dark: '#1A1A2E',
            darkLight: '#2A2A3A',
            white: '#FFFFFF',
            black: '#0A0A0A',
            gray: '#F5F0E7',
            grayLight: '#E8E0D5',
            grayDark: '#2A2A3A',
            success: '#27AE60',
            successLight: '#2ECC71',
            warning: '#F39C12',
            warningLight: '#F1C40F',
            danger: '#E74C3C',
            dangerLight: '#C0392B',
            info: '#3498DB',
            infoLight: '#5DADE2'
        },
        phone: '784949495',
        email: 'info@zain.ye',
        domain: 'zain.ye',
        address: 'اليمن - مارب'
    };

    // ================================================================
    // 7. Helpers - الأدوات المساعدة
    // ================================================================
    const Helpers = {
        // ===== التواريخ =====
        getDateString(date) {
            if (!date) return '';
            try {
                if (date.toDate && typeof date.toDate === 'function') {
                    return date.toDate().toISOString().split('T')[0];
                }
                if (typeof date === 'string') {
                    return date.split('T')[0];
                }
                if (date instanceof Date) {
                    return date.toISOString().split('T')[0];
                }
                return new Date(date).toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        },

        getFullDateString(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return '-';
            }
        },

        getShortDate(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleDateString('ar-EG');
            } catch (e) {
                return '-';
            }
        },

        getTimeString(date) {
            if (!date) return '';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return '';
            }
        },

        getDateTimeString(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return d.toLocaleString('ar-EG');
            } catch (e) {
                return '-';
            }
        },

        getRelativeTime(date) {
            if (!date) return '-';
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                
                const now = new Date();
                const diff = Math.floor((now - d) / 1000);
                
                if (diff < 0) return 'الآن';
                if (diff < 60) return 'الآن';
                if (diff < 3600) return 'منذ ' + Math.floor(diff / 60) + ' دقيقة';
                if (diff < 86400) return 'منذ ' + Math.floor(diff / 3600) + ' ساعة';
                if (diff < 604800) return 'منذ ' + Math.floor(diff / 86400) + ' يوم';
                if (diff < 2592000) return 'منذ ' + Math.floor(diff / 604800) + ' أسبوع';
                return this.getShortDate(date);
            } catch (e) {
                return '-';
            }
        },

        formatArabicDate(date) {
            const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            try {
                let d;
                if (date.toDate && typeof date.toDate === 'function') {
                    d = date.toDate();
                } else if (typeof date === 'string') {
                    d = new Date(date);
                } else if (date instanceof Date) {
                    d = date;
                } else {
                    d = new Date(date);
                }
                return days[d.getDay()] + '، ' + d.getDate() + ' ' + months[d.getMonth()];
            } catch (e) {
                return '-';
            }
        },

        isToday(date) {
            if (!date) return false;
            return this.getDateString(date) === new Date().toISOString().split('T')[0];
        },

        isYesterday(date) {
            if (!date) return false;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return this.getDateString(date) === yesterday.toISOString().split('T')[0];
        },

        isThisWeek(date) {
            if (!date) return false;
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            let dateObj;
            if (date.toDate && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            } else {
                dateObj = new Date(date);
            }
            return dateObj >= weekStart && dateObj <= now;
        },

        isThisMonth(date) {
            if (!date) return false;
            const now = new Date();
            let dateObj;
            if (date.toDate && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            } else {
                dateObj = new Date(date);
            }
            return dateObj.getMonth() === now.getMonth() &&
                   dateObj.getFullYear() === now.getFullYear();
        },

        // ===== الحسابات =====
        calculateDistance(lat1, lng1, lat2, lng2) {
            if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        },

        calculateDeliveryFee(distance, baseFee) {
            baseFee = baseFee || 500;
            if (distance <= 1) return baseFee;
            if (distance <= 3) return baseFee + (distance - 1) * 100;
            if (distance <= 5) return baseFee + 200 + (distance - 3) * 80;
            if (distance <= 10) return baseFee + 360 + (distance - 5) * 60;
            return baseFee + 660 + (distance - 10) * 40;
        },

        // ===== التوليد =====
        generateCode(length) {
            length = length || 8;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        generateId(prefix) {
            prefix = prefix || 'id';
            return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        // ===== التنسيق =====
        formatCurrency(amount) {
            return (amount || 0).toLocaleString('ar-EG') + ' ريال';
        },

        formatNumber(num) {
            return (num || 0).toLocaleString('ar-EG');
        },

        formatCompactNumber(num) {
            num = num || 0;
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        },

        // ===== التحقق =====
        isValidEmail(email) {
            if (!email || typeof email !== 'string') return false;
            const atPos = email.indexOf('@');
            const dotPos = email.lastIndexOf('.');
            return atPos > 0 && dotPos > atPos + 1 && dotPos < email.length - 1;
        },

        isValidPhone(phone) {
            if (!phone) return false;
            const cleaned = phone.split(' ').join('').split('-').join('').split('+').join('');
            if (cleaned.length < 8) return false;
            for (let i = 0; i < cleaned.length; i++) {
                const c = cleaned.charAt(i);
                if (c < '0' || c > '9') return false;
            }
            return true;
        },

        // ===== التأخير =====
        delay(ms) {
            return new Promise(function(resolve) {
                setTimeout(resolve, ms);
            });
        },

        // ===== Copy to Clipboard =====
        copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    Helpers.showToast('✅ تم النسخ', 'success');
                }).catch(function() {
                    Helpers.showToast('فشل النسخ', 'error');
                });
            } else {
                prompt('انسخ النص:', text);
            }
        },

        // ===== الإشعارات =====
        showToast(message, type, duration) {
            type = type || 'success';
            duration = duration || 3500;

            const colors = {
                success: BRAND.colors.success,
                error: BRAND.colors.danger,
                warning: BRAND.colors.warning,
                info: BRAND.colors.info
            };

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-triangle',
                warning: 'fa-exclamation-circle',
                info: 'fa-info-circle'
            };

            document.querySelectorAll('.zain-toast').forEach(function(t) {
                t.remove();
            });

            const toast = document.createElement('div');
            toast.className = 'zain-toast';
            toast.style.cssText = 
                'position:fixed;' +
                'bottom:30px;' +
                'right:30px;' +
                'background:' + colors[type] + ';' +
                'color:white;' +
                'padding:16px 28px;' +
                'border-radius:15px;' +
                'z-index:10001;' +
                'box-shadow:0 15px 50px rgba(0,0,0,0.3);' +
                'font-size:15px;' +
                'max-width:380px;' +
                'direction:rtl;' +
                'display:flex;' +
                'align-items:center;' +
                'gap:12px;' +
                'font-family:Cairo,sans-serif;' +
                'font-weight:600;' +
                'animation:zainToastSlideIn 0.3s ease;';

            toast.innerHTML = 
                '<i class="fas ' + icons[type] + '"></i>' +
                '<span>' + message + '</span>';

            document.body.appendChild(toast);

            setTimeout(function() {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                toast.style.transition = 'all 0.3s';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }, duration);
        },

        // ===== شاشة التحميل =====
        showLoader(text) {
            text = text || 'جاري التحميل...';

            let loader = document.getElementById('zainLoader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'zainLoader';
                loader.style.cssText = 
                    'position:fixed;top:0;left:0;width:100%;height:100%;' +
                    'background:rgba(26,26,46,0.9);z-index:99999;' +
                    'display:flex;align-items:center;justify-content:center;' +
                    'flex-direction:column;backdrop-filter:blur(5px);';
                document.body.appendChild(loader);
            }

            loader.innerHTML = 
                '<div style="width:80px;height:80px;background:linear-gradient(135deg,#2C5F2D,#6A7F3A);' +
                'border-radius:20px;display:flex;align-items:center;justify-content:center;' +
                'font-size:40px;box-shadow:0 20px 60px rgba(44,95,45,0.5);' +
                'animation:zainFloat 1.5s ease-in-out infinite;">🚚</div>' +
                '<div style="margin-top:20px;font-size:18px;font-weight:700;color:white;font-family:Cairo,sans-serif;">' +
                    text +
                '</div>' +
                '<div style="margin-top:15px;width:40px;height:40px;border:4px solid rgba(255,255,255,0.2);' +
                'border-top-color:#D4AF37;border-radius:50%;animation:zainSpin 0.8s linear infinite;"></div>';

            loader.style.display = 'flex';
        },

        hideLoader() {
            const loader = document.getElementById('zainLoader');
            if (loader) {
                loader.style.display = 'none';
                loader.remove();
            }
        },

        // ===== دوال التطبيقات =====
        getAppsUrls() {
            const isLocal = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';
            
            const urls = {};
            Object.keys(APPS_URLS).forEach(function(key) {
                urls[key] = isLocal ? APPS_URLS[key].local : APPS_URLS[key].online;
            });
            return urls;
        },

        navigateToApp(appType) {
            const urls = this.getAppsUrls();
            const appUrl = urls[appType];
            
            if (!appUrl) {
                this.showToast('التطبيق غير موجود', 'error');
                return;
            }
            
            console.log('الانتقال إلى:', appType, appUrl);
            window.location.href = appUrl;
        },

        getCurrentApp() {
            return CURRENT_APP;
        },

        isInApp(appType) {
            return CURRENT_APP === appType;
        },

        canAccessApp(userRole, appType) {
            const mapping = {
                'super_admin': 'admin',
                'store_owner': 'store',
                'driver': 'driver',
                'customer': 'customer'
            };
            
            return mapping[userRole] === appType;
        }
    };

    // ================================================================
    // 8. Events - نظام الأحداث
    // ================================================================
    class EventBus {
        constructor() {
            this.events = {};
        }

        on(event, callback) {
            if (!this.events[event]) this.events[event] = [];
            this.events[event].push(callback);

            const self = this;
            return function() {
                const callbacks = self.events[event] || [];
                const index = callbacks.indexOf(callback);
                if (index > -1) callbacks.splice(index, 1);
            };
        }

        once(event, callback) {
            const self = this;
            const unsubscribe = this.on(event, function(data) {
                unsubscribe();
                callback(data);
            });
            return unsubscribe;
        }

        emit(event, data) {
            const callbacks = this.events[event] || [];
            callbacks.forEach(function(cb) {
                try {
                    cb(data);
                } catch (e) {
                    console.error('Event ' + event + ' error:', e);
                }
            });
        }

        clear(event) {
            if (event) {
                delete this.events[event];
            } else {
                this.events = {};
            }
        }
    }

    const Events = new EventBus();

    // ================================================================
    // 9. State Manager
    // ================================================================
    class StateManager {
        constructor() {
            this.state = {};
            this.loadFromStorage();
        }

        set(key, value) {
            const oldValue = this.state[key];
            this.state[key] = value;

            try {
                localStorage.setItem('zain_' + key, JSON.stringify(value));
            } catch (e) {}

            Events.emit('state:' + key, {
                oldValue: oldValue,
                newValue: value
            });

            return value;
        }

        get(key, defaultValue) {
            if (this.state.hasOwnProperty(key)) {
                return this.state[key];
            }

            try {
                const stored = localStorage.getItem('zain_' + key);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {}

            return defaultValue !== undefined ? defaultValue : null;
        }

        remove(key) {
            delete this.state[key];
            localStorage.removeItem('zain_' + key);
            Events.emit('state:' + key, null);
        }

        clear() {
            const theme = this.state.theme;
            this.state = {};
            if (theme) this.state.theme = theme;

            Object.keys(localStorage).forEach(function(key) {
                if (key.indexOf('zain_') === 0) {
                    localStorage.removeItem(key);
                }
            });
        }

        loadFromStorage() {
            const self = this;
            Object.keys(localStorage).forEach(function(key) {
                if (key.indexOf('zain_') === 0) {
                    const stateKey = key.replace('zain_', '');
                    try {
                        self.state[stateKey] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {}
                }
            });
        }

        setUser(user) { return this.set('user', user); }
        getUser() { return this.get('user'); }
        isLoggedIn() { return !!this.getUser(); }
        getUserRole() { return this.get('userRole', 'guest'); }

        setCart(storeId, cart) {
            const carts = this.get('carts') || {};
            carts[storeId] = cart;
            return this.set('carts', carts);
        }

        getCart(storeId) {
            const carts = this.get('carts') || {};
            return carts[storeId] || [];
        }
    }

    const State = new StateManager();

    // ================================================================
    // 10. Navigation
    // ================================================================
    class Navigation {
        constructor() {
            this.currentPage = this.getCurrentPageName();
            this.setupPrefetchOnHover();
        }

        getCurrentPageName() {
            const path = window.location.pathname;
            return path.split('/').pop() || 'index.html';
        }

        setupPrefetchOnHover() {
            document.addEventListener('mouseover', function(e) {
                const link = e.target.closest('a[href]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (!href || 
                    href.indexOf('http') === 0 || 
                    href.indexOf('#') === 0 ||
                    href.indexOf('mailto:') === 0 ||
                    href.indexOf('tel:') === 0 ||
                    link.target === '_blank') {
                    return;
                }

                if (href.indexOf('.html') !== -1) {
                    Navigation.prototype.prefetchPage(href);
                }
            }, { passive: true });
        }

        prefetchPage(url) {
            const cleanUrl = url.split('?')[0];
            if (document.querySelector('link[rel="prefetch"][href="' + cleanUrl + '"]')) return;

            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = cleanUrl;
            link.as = 'document';
            document.head.appendChild(link);
        }

        navigate(url) {
            window.location.href = url;
        }

        goTo(page, params) {
            let url = page;
            params = params || {};
            const urlParams = new URLSearchParams(params);
            if (urlParams.toString()) {
                url += '?' + urlParams.toString();
            }
            window.location.href = url;
        }

        goBack() {
            window.history.back();
        }

        reload() {
            window.location.reload();
        }

        redirectByRole(role) {
            const config = ROLE_CONFIG[role];
            if (!config) {
                window.location.href = 'login.html';
                return;
            }
            
            const appType = config.appType;
            const urls = Helpers.getAppsUrls();
            const appUrl = urls[appType];
            
            if (appUrl) {
                window.location.href = appUrl;
            } else {
                window.location.href = config.homePage;
            }
        }
    }

    const Navigator = new Navigation();

    // ================================================================
    // 11. Security Manager
    // ================================================================
    class SecurityManager {
        async isSuperAdmin(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const doc = await db.collection('settings').doc('super_admin').get();
                return doc.exists && doc.data().email === currentUser.email;
            } catch (e) {
                return false;
            }
        }

        async isDriver(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const doc = await db.collection('drivers').doc(currentUser.uid).get();
                return doc.exists;
            } catch (e) {
                return false;
            }
        }

        async isStoreOwner(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return false;

            try {
                const snap = await db.collection('stores')
                    .where('ownerId', '==', currentUser.uid)
                    .limit(1)
                    .get();
                return !snap.empty;
            } catch (e) {
                return false;
            }
        }

        async getUserRole(user) {
            const currentUser = user || auth.currentUser;
            if (!currentUser) return ROLES.GUEST;

            if (await this.isSuperAdmin(currentUser)) return ROLES.SUPER_ADMIN;
            if (await this.isDriver(currentUser)) return ROLES.DRIVER;
            if (await this.isStoreOwner(currentUser)) return ROLES.STORE_OWNER;
            return ROLES.CUSTOMER;
        }

        async waitForAuth() {
            return new Promise(function(resolve) {
                if (auth.currentUser) {
                    resolve(auth.currentUser);
                    return;
                }

                const unsub = auth.onAuthStateChanged(function(user) {
                    unsub();
                    resolve(user);
                });

                setTimeout(function() {
                    unsub();
                    resolve(auth.currentUser);
                }, 5000);
            });
        }

        async requireAuth() {
            if (!auth.currentUser) {
                window.location.href = 'login.html';
                throw new Error('يجب تسجيل الدخول');
            }
            return auth.currentUser;
        }

        async checkAppAccess() {
            const user = auth.currentUser;
            if (!user) return true;
            
            const role = await this.getUserRole(user);
            const canAccess = Helpers.canAccessApp(role, CURRENT_APP);
            
            if (!canAccess) {
                console.warn('المستخدم لا يملك صلاحية للتطبيق الحالي');
                
                const roleConfig = ROLE_CONFIG[role];
                if (roleConfig) {
                    Zain.toast('يتم تحويلك للتطبيق المناسب...', 'info');
                    
                    await Helpers.delay(1500);
                    
                    const urls = Helpers.getAppsUrls();
                    const correctAppUrl = urls[roleConfig.appType];
                    
                    if (correctAppUrl) {
                        window.location.href = correctAppUrl;
                    }
                }
                
                return false;
            }
            
            return true;
        }

        async logout() {
            try {
                const user = auth.currentUser;
                if (user) {
                    try {
                        const driverDoc = await db.collection('drivers').doc(user.uid).get();
                        if (driverDoc.exists) {
                            await db.collection('drivers').doc(user.uid).update({
                                status: 'offline',
                                lastSeen: new Date().toISOString()
                            });
                        }
                    } catch (e) {}
                }

                await auth.signOut();

                const theme = localStorage.getItem('zain_theme');
                const lastEmail = localStorage.getItem('zain_last_email');

                localStorage.clear();
                if (theme) localStorage.setItem('zain_theme', theme);
                if (lastEmail) localStorage.setItem('zain_last_email', lastEmail);

                window.location.href = 'login.html';
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
                try {
                    await auth.signOut();
                } catch (e) {}
                window.location.href = 'login.html';
            }
        }
    }

    const Security = new SecurityManager();

    // ================================================================
    // 12. Theme Manager
    // ================================================================
    class ThemeManager {
        init() {
            const apply = function() {
                if (!document.body) {
                    setTimeout(apply, 50);
                    return;
                }

                const saved = localStorage.getItem('zain_theme') || 
                              localStorage.getItem('theme');

                if (saved === 'dark') {
                    document.body.classList.add('dark-mode');
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', apply);
            } else {
                apply();
            }
        }

        toggle() {
            try {
                if (!document.body) return false;

                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');

                localStorage.setItem('zain_theme', isDark ? 'dark' : 'light');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                State.set('theme', isDark ? 'dark' : 'light');
                Events.emit('theme:changed', isDark ? 'dark' : 'light');

                return isDark;
            } catch (e) {
                return false;
            }
        }

        isDark() {
            return document.body ? document.body.classList.contains('dark-mode') : false;
        }
    }

    const Theme = new ThemeManager();

    // ================================================================
    // 13. Notification System - محسّن
    // ================================================================
    class NotificationSystem {
        constructor() {
            this.unsubscribeFunctions = {};
            this.lastProcessedIds = new Set();
        }

        async save(userId, notification) {
            try {
                const docRef = await db.collection('notifications').add({
                    userId: userId,
                    title: notification.title,
                    body: notification.body,
                    type: notification.type || 'info',
                    icon: notification.icon || 'fa-bell',
                    data: notification.data || {},
                    read: false,
                    createdAt: new Date().toISOString()
                });
                return docRef.id;
            } catch (error) {
                console.error('خطأ في حفظ الإشعار:', error);
                return null;
            }
        }

        async notifyUser(userId, title, body, data) {
            data = data || {};
            return this.save(userId, {
                title: title,
                body: body,
                data: data,
                type: 'info'
            });
        }

        async notifySuperAdmin(title, body, data) {
            data = data || {};
            try {
                const doc = await db.collection('settings').doc('super_admin').get();
                if (doc.exists && doc.data().uid) {
                    return this.save(doc.data().uid, {
                        title: title,
                        body: body,
                        data: data,
                        type: 'admin',
                        icon: 'fa-crown'
                    });
                }
            } catch (e) {}
            return null;
        }

        async notifyDriver(driverId, title, body, data) {
            data = data || {};
            return this.save(driverId, {
                title: title,
                body: body,
                data: data,
                type: 'driver',
                icon: 'fa-motorcycle'
            });
        }

        async notifyStore(storeId, title, body, data) {
            data = data || {};
            return this.save(storeId, {
                title: title,
                body: body,
                data: data,
                type: 'store',
                icon: 'fa-store'
            });
        }

        async getUserNotifications(limit) {
            limit = limit || 50;
            const user = auth.currentUser;
            if (!user) return [];

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        const data = doc.data();
                        data.id = doc.id;
                        return data;
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getUnreadCount() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .where('read', '==', false)
                    .limit(100)
                    .get();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        async markAsRead(notificationId) {
            try {
                await db.collection('notifications').doc(notificationId).update({
                    read: true,
                    readAt: new Date().toISOString()
                });
            } catch (error) {}
        }

        async markAllAsRead() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .where('read', '==', false)
                    .limit(100)
                    .get();

                const batch = db.batch();
                snap.docs.forEach(function(doc) {
                    batch.update(doc.ref, {
                        read: true,
                        readAt: new Date().toISOString()
                    });
                });
                await batch.commit();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        async deleteNotification(notificationId) {
            try {
                await db.collection('notifications').doc(notificationId).delete();
            } catch (error) {}
        }

        async deleteAllNotifications() {
            const user = auth.currentUser;
            if (!user) return 0;

            try {
                const snap = await db.collection('notifications')
                    .where('userId', '==', user.uid)
                    .limit(100)
                    .get();

                const batch = db.batch();
                snap.docs.forEach(function(doc) {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                return snap.size;
            } catch (error) {
                return 0;
            }
        }

        playSound() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (e) {}
        }

        async requestPermission() {
            if (!('Notification' in window)) return false;
            try {
                if (Notification.permission === 'granted') return true;
                if (Notification.permission === 'denied') return false;

                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (e) {
                return false;
            }
        }

        // ================================================================
        // ✅ listenForNewNotifications - محسّن
        // ================================================================
        listenForNewNotifications(callback) {
            const user = auth.currentUser;
            if (!user) {
                console.warn('⚠️ لا يوجد مستخدم مسجل - لا يمكن الاستماع للإشعارات');
                return null;
            }

            // ✅ إلغاء الاشتراك القديم
            if (this.unsubscribeFunctions.notifications) {
                this.unsubscribeFunctions.notifications();
                this.unsubscribeFunctions.notifications = null;
            }

            const self = this;
            let isFirstSnapshot = true;
            let lastProcessTime = 0;
            const PROCESS_INTERVAL = 5000; // 5 ثوانٍ بين المعالجات

            console.log('🔔 بدء الاستماع للإشعارات الجديدة للمستخدم:', user.uid);

            this.unsubscribeFunctions.notifications = db.collection('notifications')
                .where('userId', '==', user.uid)
                .where('read', '==', false)
                .limit(50)
                .onSnapshot(function(snapshot) {
                    const now = Date.now();
                    
                    // ✅ تجاهل التحديثات السريعة
                    if (!isFirstSnapshot && now - lastProcessTime < PROCESS_INTERVAL) {
                        return;
                    }
                    lastProcessTime = now;

                    snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            data.id = change.doc.id;

                            // ✅ تجاهل الإشعارات القديمة
                            const age = Date.now() - new Date(data.createdAt).getTime();
                            
                            // ✅ تجاهل الإشعارات المعالجة مسبقاً
                            if (self.lastProcessedIds.has(data.id)) {
                                return;
                            }
                            
                            // ✅ معالجة الإشعارات الحديثة فقط (أقل من 30 ثانية)
                            if (age < 30000 && !isFirstSnapshot) {
                                console.log('🔔 إشعار جديد:', data.title);
                                
                                // ✅ إضافة إلى المعالجة
                                self.lastProcessedIds.add(data.id);
                                
                                // ✅ حد أقصى 100 معرف
                                if (self.lastProcessedIds.size > 100) {
                                    const firstId = self.lastProcessedIds.values().next().value;
                                    self.lastProcessedIds.delete(firstId);
                                }
                                
                                // ✅ تشغيل الصوت
                                self.playSound();
                                
                                // ✅ عرض Toast
                                Helpers.showToast(data.title, 'info');
                                
                                // ✅ استدعاء callback
                                if (callback && typeof callback === 'function') {
                                    try {
                                        callback(data);
                                    } catch (e) {
                                        console.error('خطأ في callback الإشعار:', e);
                                    }
                                }
                            }
                        }
                    });

                    isFirstSnapshot = false;

                }, function(error) {
                    console.error('❌ خطأ في الاستماع للإشعارات:', error);
                });

            return this.unsubscribeFunctions.notifications;
        }

        // ✅ إلغاء جميع الاشتراكات
        unsubscribeAll() {
            Object.keys(this.unsubscribeFunctions).forEach(function(key) {
                if (self.unsubscribeFunctions[key]) {
                    self.unsubscribeFunctions[key]();
                    self.unsubscribeFunctions[key] = null;
                }
            });
        }
    }

    const Notifications = new NotificationSystem();

    // ================================================================
    // 14. Cart System
    // ================================================================
    class CartSystem {
        constructor() {
            this.currentStoreId = null;
        }

        setStore(storeId) {
            this.currentStoreId = storeId;
            State.set('currentStoreId', storeId);
        }

        getCart() {
            if (!this.currentStoreId) return [];
            return State.getCart(this.currentStoreId);
        }

        addItem(product, quantity) {
            quantity = quantity || 1;
            const cart = this.getCart();
            const existing = cart.find(function(i) {
                return i.id === product.id;
            });

            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }

            this.saveCart(cart);
            Events.emit('cart:updated', cart);
            return cart;
        }

        removeItem(productId) {
            let cart = this.getCart();
            cart = cart.filter(function(i) {
                return i.id !== productId;
            });
            this.saveCart(cart);
            Events.emit('cart:updated', cart);
            return cart;
        }

        updateQuantity(productId, newQuantity) {
            if (newQuantity <= 0) {
                return this.removeItem(productId);
            }

            const cart = this.getCart();
            const item = cart.find(function(i) {
                return i.id === productId;
            });

            if (item) {
                item.quantity = newQuantity;
                this.saveCart(cart);
                Events.emit('cart:updated', cart);
            }

            return cart;
        }

        saveCart(cart) {
            if (this.currentStoreId) {
                State.setCart(this.currentStoreId, cart);
            }
        }

        clear() {
            if (this.currentStoreId) {
                State.setCart(this.currentStoreId, []);
            }
            Events.emit('cart:updated', []);
        }

        getTotal() {
            const cart = this.getCart();
            return {
                count: cart.reduce(function(sum, i) {
                    return sum + i.quantity;
                }, 0),
                subtotal: cart.reduce(function(sum, i) {
                    return sum + (i.price * i.quantity);
                }, 0)
            };
        }
    }

    const Cart = new CartSystem();

    // ================================================================
    // 15. Orders System - محسّن
    // ================================================================
    class OrderSystem {
        async create(orderData) {
            const user = auth.currentUser;

            try {
                const order = Object.assign({}, orderData, {
                    customerId: user ? user.uid : null,
                    customerName: orderData.customerName ||
                                 (user ? user.displayName : null) ||
                                 'زائر',
                    status: 'pending',
                    trackingCode: Helpers.generateCode(8),
                    createdAt: new Date().toISOString()
                });

                const docRef = await db.collection('orders').add(order);
                const fullOrder = Object.assign({ id: docRef.id }, order);

                Events.emit('order:created', fullOrder);

                return fullOrder;
            } catch (error) {
                console.error('خطأ في إنشاء الطلب:', error);
                throw error;
            }
        }

        async updateStatus(orderId, newStatus, metadata) {
            metadata = metadata || {};

            try {
                const updateData = {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };

                updateData[newStatus + 'At'] = new Date().toISOString();

                if (metadata.driverId) {
                    updateData.driverId = metadata.driverId;
                    updateData.driverName = metadata.driverName;
                    updateData.driverAssignedAt = new Date().toISOString();
                }

                if (metadata.reason) {
                    updateData.cancellationReason = metadata.reason;
                }

                // ✅ استخدام set مع merge لتقليل حجم الكتابة
                await db.collection('orders').doc(orderId).set(updateData, { merge: true });

                const order = await this.getById(orderId);

                if (order) {
                    const statusMessages = {
                        confirmed: 'تم تأكيد الطلب',
                        preparing: 'بدء التحضير',
                        ready: 'جاهز للتوصيل',
                        delivering: 'في الطريق',
                        delivered: 'تم التوصيل',
                        cancelled: 'تم الإلغاء'
                    };

                    const message = statusMessages[newStatus];

                    if (message && order.customerId) {
                        await Notifications.notifyUser(
                            order.customerId,
                            message,
                            'طلبك #' + (order.trackingCode || orderId.slice(-8)),
                            { orderId: orderId }
                        );
                    }
                }

                Events.emit('order:updated', Object.assign({
                    orderId: orderId,
                    newStatus: newStatus
                }, metadata));

                return updateData;
            } catch (error) {
                throw error;
            }
        }

        async confirm(orderId) { 
            return this.updateStatus(orderId, 'confirmed'); 
        }

        async startPreparing(orderId) { 
            return this.updateStatus(orderId, 'preparing'); 
        }

        async markReady(orderId) { 
            return this.updateStatus(orderId, 'ready'); 
        }

        async assignDriver(orderId, driverId, driverName) {
            return this.updateStatus(orderId, 'delivering', {
                driverId: driverId,
                driverName: driverName
            });
        }

        async markDelivered(orderId) { 
            return this.updateStatus(orderId, 'delivered'); 
        }

        async cancel(orderId, reason) {
            return this.updateStatus(orderId, 'cancelled', { reason: reason || '' });
        }

        async getById(orderId) {
            try {
                const doc = await db.collection('orders').doc(orderId).get();
                if (!doc.exists) return null;
                return Object.assign({ id: doc.id }, doc.data());
            } catch (error) {
                return null;
            }
        }

        async getCustomerOrders(customerId, limit) {
            limit = limit || 50;

            try {
                const snap = await db.collection('orders')
                    .where('customerId', '==', customerId)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getStoreOrders(storeId, limit) {
            limit = limit || 50;

            try {
                const snap = await db.collection('orders')
                    .where('storeId', '==', storeId)
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getDriverOrders(driverId, limit) {
            limit = limit || 100;
            
            try {
                const snap = await db.collection('orders')
                    .where('driverId', '==', driverId)
                    .limit(limit)
                    .get();

                return snap.docs.map(function(doc) {
                    return Object.assign({ id: doc.id }, doc.data());
                });
            } catch (error) {
                return [];
            }
        }

        async getAllOrders(limit) {
            limit = limit || 200;

            try {
                const snap = await db.collection('orders')
                    .limit(limit)
                    .get();

                return snap.docs
                    .map(function(doc) {
                        return Object.assign({ id: doc.id }, doc.data());
                    })
                    .sort(function(a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
            } catch (error) {
                return [];
            }
        }

        async getReadyOrders() {
            try {
                const snap = await db.collection('orders')
                    .where('status', '==', 'ready')
                    .limit(50)
                    .get();

                return snap.docs.map(function(doc) {
                    return Object.assign({ id: doc.id }, doc.data());
                });
            } catch (error) {
                return [];
            }
        }

        subscribeToOrder(orderId, callback) {
            return db.collection('orders').doc(orderId).onSnapshot(function(doc) {
                if (doc.exists) {
                    callback(Object.assign({ id: doc.id }, doc.data()));
                }
            });
        }

        async getStats(period) {
            period = period || 'today';
            
            try {
                const orders = await this.getAllOrders();
                let filtered = orders;
                
                if (period === 'today') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isToday(o.createdAt);
                    });
                } else if (period === 'week') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isThisWeek(o.createdAt);
                    });
                } else if (period === 'month') {
                    filtered = orders.filter(function(o) {
                        return Helpers.isThisMonth(o.createdAt);
                    });
                }
                
                return {
                    total: filtered.length,
                    delivered: filtered.filter(function(o) { return o.status === 'delivered'; }).length,
                    pending: filtered.filter(function(o) { return o.status === 'pending'; }).length,
                    revenue: filtered.reduce(function(sum, o) { return sum + (o.total || 0); }, 0),
                    avgOrder: filtered.length ? 
                        filtered.reduce(function(sum, o) { return sum + (o.total || 0); }, 0) / filtered.length 
                        : 0
                };
            } catch (error) {
                return { total: 0, delivered: 0, pending: 0, revenue: 0, avgOrder: 0 };
            }
        }
    }

    const Orders = new OrderSystem();

    // ================================================================
    // 16. ضمان مستند العميل
    // ================================================================
    async function ensureCustomerDocument(user) {
        if (!user) return null;

        try {
            const ref = db.collection('customers').doc(user.uid);
            const doc = await ref.get();

            if (doc.exists) {
                return Object.assign({ id: user.uid }, doc.data());
            }

            const newData = {
                name: user.displayName || 'مستخدم',
                email: user.email,
                phone: '',
                points: 100,
                walletBalance: 0,
                addresses: [],
                createdAt: new Date().toISOString()
            };

            await ref.set(newData);
            return Object.assign({ id: user.uid }, newData);
        } catch (error) {
            console.error('خطأ في ضمان مستند العميل:', error);
            return null;
        }
    }

    // ================================================================
    // 17. إنشاء مستخدمين بأمان (بدون تسجيل خروج الأدمن)
    // ================================================================
    async function createUserWithSecondaryApp(email, password, userData) {
        console.log('إنشاء مستخدم جديد:', email, '| الدور:', userData.role);
        
        let secondaryApp = null;
        let secondaryAuth = null;
        
        try {
            const adminUser = auth.currentUser;
            if (!adminUser) {
                throw new Error('يجب تسجيل دخول الأدمن أولاً');
            }
            
            const adminEmail = adminUser.email;
            console.log('الأدمن الحالي:', adminEmail);
            
            const appName = 'SecondaryApp_' + Date.now();
            secondaryApp = firebase.initializeApp(FIREBASE_CONFIG, appName);
            secondaryAuth = secondaryApp.auth();
            
            console.log('تم إنشاء التطبيق الثانوي');
            
            const userCred = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            const newUser = userCred.user;
            
            console.log('تم إنشاء الحساب:', newUser.uid);
            
            await db.collection('users').doc(newUser.uid).set({
                uid: newUser.uid,
                email: email,
                name: userData.name || '',
                role: userData.role || 'customer',
                createdAt: new Date().toISOString()
            });
            console.log('تم حفظ user document');
            
            if (userData.role === 'driver') {
                await db.collection('drivers').doc(newUser.uid).set({
                    id: newUser.uid,
                    name: userData.name || '',
                    email: email,
                    phone: userData.phone || '',
                    status: 'offline',
                    rating: 5,
                    totalDeliveries: 0,
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء مستند المندوب');
                
            } else if (userData.role === 'store_owner') {
                const storeRef = await db.collection('stores').add({
                    name: userData.storeName || '',
                    type: userData.storeType || 'restaurant',
                    status: userData.status || 'active',
                    phone: userData.phone || '',
                    location: userData.location || '',
                    image: userData.image || 'https://via.placeholder.com/400x200/2C5F2D/FFFFFF?text=' + encodeURIComponent(userData.storeName || 'Store'),
                    ownerId: newUser.uid,
                    ownerEmail: email,
                    ownerName: userData.name || userData.storeName || '',
                    products: [],
                    ordersCount: 0,
                    rating: 0,
                    settings: {
                        deliveryFee: userData.deliveryFee || 500,
                        storeLat: 15.3694,
                        storeLng: 44.1910
                    },
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء المتجر:', storeRef.id);
                
            } else if (userData.role === 'customer') {
                await db.collection('customers').doc(newUser.uid).set({
                    id: newUser.uid,
                    name: userData.name || '',
                    email: email,
                    phone: userData.phone || '',
                    points: 100,
                    walletBalance: 0,
                    addresses: [],
                    createdAt: new Date().toISOString()
                });
                console.log('تم إنشاء مستند العميل');
            }
            
            await secondaryAuth.signOut();
            console.log('تم تسجيل خروج المستخدم الجديد');
            
            await secondaryApp.delete();
            console.log('تم حذف التطبيق الثانوي');
            
            if (auth.currentUser && auth.currentUser.email === adminEmail) {
                console.log('الأدمن لا يزال مسجل دخول:', adminEmail);
            } else {
                console.warn('تحذير: قد تكون جلسة الأدمن تأثرت');
            }
            
            console.log('تم إنشاء المستخدم بنجاح!');
            
            return {
                success: true,
                newUserId: newUser.uid,
                email: email,
                role: userData.role
            };
            
        } catch (error) {
            console.error('خطأ في إنشاء المستخدم:', error);
            
            if (secondaryAuth) {
                try { await secondaryAuth.signOut(); } catch (e) {}
            }
            if (secondaryApp) {
                try { await secondaryApp.delete(); } catch (e) {}
            }
            
            throw error;
        }
    }

    // ================================================================
    // 18. Auth State Listener
    // ================================================================
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            console.log('تسجيل الدخول:', user.email);
            console.log('التطبيق الحالي:', CURRENT_APP);

            State.setUser({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'مستخدم',
                photoURL: user.photoURL
            });

            try {
                const role = await Security.getUserRole(user);
                State.set('userRole', role);
                console.log('الدور:', role);
            } catch (e) {
                console.error('خطأ في تحديد الدور:', e);
            }

            Events.emit('auth:login', { user: user });
        } else {
            console.log('تسجيل الخروج');

            State.setUser(null);
            State.set('userRole', 'guest');
            Events.emit('auth:logout');
        }
    });

    // ================================================================
    // 19. Global Styles
    // ================================================================
    const globalStyles = document.createElement('style');
    globalStyles.textContent = 
        '@keyframes zainSpin {' +
        '    to { transform: rotate(360deg); }' +
        '}' +
        '@keyframes zainFloat {' +
        '    0%, 100% { transform: translateY(0); }' +
        '    50% { transform: translateY(-15px); }' +
        '}' +
        '@keyframes zainToastSlideIn {' +
        '    from { transform: translateX(100px); opacity: 0; }' +
        '    to { transform: translateX(0); opacity: 1; }' +
        '}' +
        '@keyframes zainPulse {' +
        '    0%, 100% { transform: scale(1); }' +
        '    50% { transform: scale(1.05); }' +
        '}' +
        '@keyframes zainFadeIn {' +
        '    from { opacity: 0; transform: translateY(20px); }' +
        '    to { opacity: 1; transform: translateY(0); }' +
        '}' +
        'body {' +
        '    animation: zainFadeIn 0.3s ease;' +
        '}' +
        'html {' +
        '    scroll-behavior: smooth;' +
        '}' +
        'button, a {' +
        '    -webkit-tap-highlight-color: transparent;' +
        '}';

    document.head.appendChild(globalStyles);

    // ================================================================
    // 20. Export
    // ================================================================
    window.Zain = window.ZAIN = window.Haven = {
        // Core
        db: db,
        auth: auth,
        storage: storage,

        // Config
        BRAND: BRAND,
        ROLES: ROLES,
        ROLE_CONFIG: ROLE_CONFIG,
        FIREBASE_CONFIG: FIREBASE_CONFIG,
        APPS_URLS: APPS_URLS,
        CURRENT_APP: CURRENT_APP,

        // Managers
        Events: Events,
        State: State,
        Navigator: Navigator,
        Security: Security,
        Theme: Theme,
        Notifications: Notifications,
        Cart: Cart,
        Orders: Orders,

        // Helpers
        Helpers: Helpers,
        ensureCustomerDocument: ensureCustomerDocument,
        
        // User creation
        createUserWithSecondaryApp: createUserWithSecondaryApp,

        // Quick Access
        toast: Helpers.showToast,
        logout: function() { return Security.logout(); },
        navigate: function(page, params) { return Navigator.goTo(page, params); },
        toggleTheme: function() { return Theme.toggle(); },
        
        // Apps
        navigateToApp: function(appType) { return Helpers.navigateToApp(appType); },
        getCurrentApp: function() { return Helpers.getCurrentApp(); },
        isInApp: function(appType) { return Helpers.isInApp(appType); },
        getAppsUrls: function() { return Helpers.getAppsUrls(); },
        checkAppAccess: function() { return Security.checkAppAccess(); },

        // Notifications
        listenForNewNotifications: function(callback) { 
            return Notifications.listenForNewNotifications(callback); 
        },
        unsubscribeAllNotifications: function() {
            return Notifications.unsubscribeAll();
        },

        // Version
        version: '10.0.0'
    };

    // Legacy compatibility
    window.getDateString = Helpers.getDateString;
    window.getFullDateString = Helpers.getFullDateString;
    window.getShortDate = Helpers.getShortDate;
    window.getTimeString = Helpers.getTimeString;
    window.getRelativeTime = Helpers.getRelativeTime;
    window.formatArabicDate = Helpers.formatArabicDate;
    window.isToday = Helpers.isToday;
    window.showToast = Helpers.showToast;
    window.showNotification = Helpers.showToast;
    window.calculateDistance = Helpers.calculateDistance;
    window.calculateDeliveryFee = Helpers.calculateDeliveryFee;

    // ================================================================
    // 21. Init
    // ================================================================
    if (document.readyState === 'complete') {
        Theme.init();
    } else {
        window.addEventListener('load', function() {
            Theme.init();
        });
    }

    setTimeout(function() {
        Theme.init();
    }, 3000);

    // ================================================================
    // 22. Console Branding
    // ================================================================
    console.log('%c🚚 توصيل زين | ZAIN DELIVERY v10.0.0', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
    console.log('%c✅ محسّن للأداء - بدون تجميد', 'color: #27AE60; font-weight: bold;');
    console.log('%c📱 التطبيق الحالي: ' + CURRENT_APP, 'color: #27AE60; font-weight: bold;');
    console.log('%c📞 الدعم: 784949495 | 🌐 zain.ye', 'color: #3498DB; font-weight: bold;');

})();