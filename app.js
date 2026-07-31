document.addEventListener('DOMContentLoaded', () => {
    initAppNavigation();
    initActivity1();
    initActivity2();
});

/* --- Sidebar Activity Switching --- */
function initAppNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.activity-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Update sidebar buttons
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Update visible sections
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Show toast feedback
            const activityName = item.querySelector('span:not(.dot)').textContent;
            showToast(`Loaded ${activityName}`);
            
            // If switching to Activity 2, reset slides
            if (targetId === 'activity-2-section') {
                resetSlides();
            }
        });
    });
}

/* --- Activity 1: Heading Elements (Submission Flow) --- */
function initActivity1() {
    const runBtn = document.getElementById('a1-btn-run');
    const handinBtn = document.getElementById('a1-btn-handin');
    const nextBtn = document.getElementById('a1-btn-next-activity');
    
    const canvasPreview = document.getElementById('a1-canvas-preview');
    const loadingOverlay = document.getElementById('a1-loading-overlay');
    const celebrationOverlay = document.getElementById('a1-celebration-overlay');
    const actionRow = document.getElementById('a1-action-row');
    
    // RUN Button click
    runBtn.addEventListener('click', () => {
        showToast('Running your code...');
        
        // Micro-animation for blocks
        const blocks = canvasPreview.querySelectorAll('.canvas-block');
        blocks.forEach((block, idx) => {
            block.style.transform = 'scale(0.95)';
            setTimeout(() => {
                block.style.transform = 'scale(1)';
            }, 150 + idx * 100);
        });
    });
    
    // HAND IN Button click (The Redesigned Flow)
    handinBtn.addEventListener('click', () => {
        // 1. Hide preview and actions
        canvasPreview.style.visibility = 'hidden';
        actionRow.style.visibility = 'hidden';
        
        // 2. Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        // 3. Background submission delay (1.2 seconds)
        setTimeout(() => {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Show success screen
            celebrationOverlay.style.display = 'flex';
            
            // Trigger celebration confetti
            triggerCelebrationConfetti(celebrationOverlay);
            showToast('🎉 Great Job! Project Handed In.');
        }, 1200);
    });
    
    // NEXT ACTIVITY Button click
    nextBtn.addEventListener('click', () => {
        // Reset Activity 1 elements
        celebrationOverlay.style.display = 'none';
        canvasPreview.style.visibility = 'visible';
        actionRow.style.visibility = 'visible';
        
        // Switch to Activity 2
        const btnActivity2 = document.getElementById('btn-activity-2');
        if (btnActivity2) {
            btnActivity2.click();
        }
    });
}

/* --- Activity 2: Machine Learning (Slide Navigation) --- */
let currentSlide = 1;
const totalSlides = 5;

const slideData = [
    {
        title: "1. Time for some project fun!",
        desc: "Welcome to your chatbot activity. Let's learn how computers speak to us using simple Python code! Go ahead and check out the concepts."
    },
    {
        title: "2. What is a Chatbot?",
        desc: "A chatbot is a computer program designed to simulate conversation with human users, especially over the Internet. It answers questions like a human friend!"
    },
    {
        title: "3. Step 1: Greeting the User",
        desc: "We use the print() function in Python to display text. We write print('Hello! I\\'m ChatBuddy.') to start off our dialog."
    },
    {
        title: "4. Step 2: Asking their Name",
        desc: "We use the input() function to read name, then print('Nice to meet you, ' + name + '!'). This stores text and greets them back."
    },
    {
        title: "5. Ready for a deep dive?",
        desc: "Now that we know the basics, let's open the code panel and write a small chatbot program ourselves!"
    }
];

function initActivity2() {
    const nextSlideBtn = document.getElementById('a2-btn-next-slide');
    
    // Next Button click handler
    nextSlideBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides) {
            currentSlide++;
            renderSlide();
            showToast(`Advanced to slide ${currentSlide}`);
        } else {
            // Completed Activity 2!
            showToast('🎉 Awesome! You completed all activities!');
            
            // Mark Activity 2 as completed / checked
            const btnActivity2 = document.getElementById('btn-activity-2');
            btnActivity2.classList.add('completed');
            btnActivity2.querySelector('span:not(.dot)').textContent = 'Activity 2 ✓';
            
            // Auto return to Activity 1
            setTimeout(() => {
                const btnActivity1 = document.getElementById('btn-activity-1');
                if (btnActivity1) {
                    btnActivity1.click();
                }
            }, 1000);
        }
    });
    
    // Initial slide render
    renderSlide();
}

function renderSlide() {
    const slideContent = document.getElementById('a2-slide-content');
    const dotsContainer = document.getElementById('a2-dots-container');
    const statusText = document.getElementById('a2-status-text');
    const nextSlideBtn = document.getElementById('a2-btn-next-slide');
    const peekingMascot = document.getElementById('a2-peeking-mascot');
    
    // 1. Render slide text
    const slide = slideData[currentSlide - 1];
    slideContent.innerHTML = `
        <h3>${slide.title}</h3>
        <p>${slide.desc}</p>
    `;
    
    // 2. Render pagination dots
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `k12-slide-dot ${i === currentSlide ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    }
    
    // 3. Render slide card background shade changes slightly for fun
    const colors = ['#FFE4E6', '#FEE2E2', '#FFEDD5', '#FEF3C7', '#D1FAE5'];
    slideContent.style.backgroundColor = colors[currentSlide - 1];
    
    // 4. Update status texts, next button label, and mascot visibility
    if (currentSlide === totalSlides) {
        statusText.textContent = "Yay! move to the next Activity!";
        statusText.className = "k12-status-text success";
        nextSlideBtn.textContent = "Next Activity";
        nextSlideBtn.style.backgroundColor = '#10B981';
        peekingMascot.style.display = 'flex';
    } else {
        statusText.textContent = "Complete all Slides to move to next activity!";
        statusText.className = "k12-status-text";
        nextSlideBtn.textContent = "Next";
        nextSlideBtn.style.backgroundColor = '#10B981';
        peekingMascot.style.display = 'none';
    }
}

function resetSlides() {
    currentSlide = 1;
    renderSlide();
}

/* --- Visual Celebration & Confetti Spawner --- */
function triggerCelebrationConfetti(parentEl) {
    // Clear any leftover confetti pieces
    const existingConfetti = parentEl.querySelectorAll('.confetti-piece');
    existingConfetti.forEach(c => c.remove());
    
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
    const containerWidth = parentEl.offsetWidth || 500;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        const size = Math.random() * 8 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        
        // Random horizontal spawn position
        confetti.style.left = `${Math.random() * 90 + 5}%`;
        confetti.style.top = `-10px`;
        confetti.style.opacity = Math.random();
        confetti.style.zIndex = 100;
        
        parentEl.appendChild(confetti);
        
        // Set falling animation details
        const fallDuration = Math.random() * 1.5 + 1.2;
        const spinAngle = Math.random() * 360;
        
        confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(320px) rotate(${spinAngle}deg)`, opacity: 0 }
        ], {
            duration: fallDuration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });
        
        // Cleanup element after fall finishes
        setTimeout(() => {
            confetti.remove();
        }, fallDuration * 1000);
    }
}

/* --- Toast Notification System --- */
function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('active');
    
    // Auto hide after 2.5s
    setTimeout(() => {
        toast.classList.remove('active');
    }, 2500);
}
