// Auto-reload script for menu updates
(function() {
    'use strict';
    
    let lastMenuVersion = localStorage.getItem('menuVersion') || '0';
    let checkInterval;
    
    // Function to check for menu updates
    function checkMenuUpdates() {
        fetch('menu-data.json?v=' + Date.now())
            .then(response => response.json())
            .then(data => {
                // Tạo version hash từ nội dung menu
                const menuContent = JSON.stringify(data);
                const currentVersion = btoa(menuContent).substring(0, 10);
                
                if (currentVersion !== lastMenuVersion) {
                    console.log('Menu updated detected! Reloading...');
                    localStorage.setItem('menuVersion', currentVersion);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log('Error checking menu updates:', error);
            });
    }
    
    // Start checking for updates every 30 seconds
    function startAutoReload() {
        checkInterval = setInterval(checkMenuUpdates, 30000); // 30 seconds
        console.log('Auto-reload enabled. Checking for menu updates every 30 seconds.');
    }
    
    // Stop checking for updates
    function stopAutoReload() {
        if (checkInterval) {
            clearInterval(checkInterval);
            console.log('Auto-reload disabled.');
        }
    }
    
    // Expose functions globally
    window.MenuAutoReload = {
        start: startAutoReload,
        stop: stopAutoReload,
        check: checkMenuUpdates
    };
    
    // Auto-start when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAutoReload);
    } else {
        startAutoReload();
    }
    
})(); 