// === Make resetChatScreen globally accessible ===
function resetChatScreen() {
    const messageDisplay = document.getElementById("message-display");
    const chatHeading = document.getElementById("initial-heading"); // Clear all messages
    messageDisplay.innerHTML = ""; // Show heading again
    messageDisplay.classList.remove("active"); // Hide the message display container
    chatHeading.style.display = "block";   // Reset layout
    const centerUI = document.querySelector(".center-ui");
    centerUI.classList.remove("after-send");
    centerUI.classList.remove("chat-mode"); // Restart animation
    chatHeading.classList.remove("animate-type");
    void chatHeading.offsetWidth;
    chatHeading.classList.add("animate-type");
    // const introOverlay = document.getElementById("jarvis-intro-overlay");
    // if (introOverlay) {
    //   introOverlay.style.display = "flex";
    //   introOverlay.style.animation = "none"; // reset animation
    //   void introOverlay.offsetWidth; // force reflow
    //   introOverlay.style.animation = "overlayFadeOut 1s 2.4s forwards";
    //   setTimeout(() => {
    //     introOverlay.style.display = "none";
    //   }, 2500);
    // }
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    // ===== Element References =====
    const heading = document.querySelector(".animate-type");
    const input = document.querySelector(".chat-input");
    const sendBtn = document.querySelector(".send-btn");
    const messageDisplay = document.getElementById("message-display");
    const chatHeading = document.getElementById("initial-heading");
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.querySelector(".side_bar");
    const icon = document.getElementById("sidebarIcon");
    const newChatBtn = document.getElementById("newChatBtn");
    const newChatIconBtn = document.getElementById("newChatIconBtn");
    newChatBtn.addEventListener("click", resetChatScreen);
    newChatIconBtn.addEventListener("click", resetChatScreen); 
    heading.addEventListener("animationend", () => {
      setTimeout(() => {
        heading.classList.remove("animate-type");
        void heading.offsetWidth;
        heading.classList.add("animate-type");
      }, 100);
    });
  
    const attachBtn = document.getElementById("attach-btn");
    const attachMenu = document.getElementById("attach-menu");
    const imageUploadInput = document.getElementById("image-upload");
    const fileUploadInput = document.getElementById("file-upload");
    const filePreviewsContainer = document.getElementById("file-previews-container");
    let attachedFiles = [];
    
    attachBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      attachMenu.classList.toggle("hidden");
    });
  
    document.addEventListener("click", (e) => {
      if (!attachBtn.contains(e.target) && !attachMenu.contains(e.target)) {
        attachMenu.classList.add("hidden");
      }
    });

    // Handle file attachments
    function handleFileAttachment(files) {
      if (!files) return;
      attachMenu.classList.add('hidden'); // Close menu after selection

      for (const file of files) {
        if (!attachedFiles.some(f => f.name === file.name && f.size === file.size)) {
          attachedFiles.push(file);
          renderFilePreview(file);
        }
      }
    }

    imageUploadInput.addEventListener("change", (e) => handleFileAttachment(e.target.files));
    fileUploadInput.addEventListener("change", (e) => handleFileAttachment(e.target.files));

    function renderFilePreview(file) {
        const previewEl = document.createElement("div");
        previewEl.classList.add("file-preview");
      
        if (file.type.startsWith('image/')) {
          previewEl.classList.add("image-preview");
          const reader = new FileReader();
          reader.onload = (e) => {
            previewEl.innerHTML = `
              <img src="${e.target.result}" alt="${file.name}" />
              <span>${file.name}</span>
              <button class="close-preview">&times;</button>
            `;
      
            const closeBtn = previewEl.querySelector(".close-preview");
            closeBtn.addEventListener("click", () => {
              previewEl.remove();
              attachedFiles = attachedFiles.filter(f => f.name !== file.name || f.size !== file.size);
            });
      
            filePreviewsContainer.appendChild(previewEl); // ✅ append after image is ready
          };
          reader.readAsDataURL(file);
        } else {
          previewEl.innerHTML = `
            <span class="material-symbols-outlined file-icon">attach_file</span>
            <span>${file.name}</span>
            <button class="close-preview">&times;</button>
          `;
      
          const closeBtn = previewEl.querySelector(".close-preview");
          closeBtn.addEventListener("click", () => {
            previewEl.remove();
            attachedFiles = attachedFiles.filter(f => f.name !== file.name || f.size !== file.size);
          });
      
          filePreviewsContainer.appendChild(previewEl); // ✅ safe for non-images
        }
      }
      
  
    const introOverlay = document.getElementById("jarvis-intro-overlay");
    if (introOverlay) {
      setTimeout(() => {
        introOverlay.classList.add("fade-out");
        introOverlay.addEventListener("animationend", () => {
          introOverlay.style.display = "none";
        });
      }, 2500); // Show intro for 4 seconds, then fade out & hide
    }
    
    let recognition;
    let silenceTimer;
  
    const SILENCE_TIMEOUT = 2000; // 3 seconds of silence to auto-stop // Helper function to manage the silence timer
  
    function resetSilenceTimer() {
      clearTimeout(silenceTimer); // Clear any existing timer
  
      silenceTimer = setTimeout(() => {
        if (recognition && recognition.recognizing) {
          console.log("Silence detected, automatically stopping recognition.");
  
          recognition.stop(); // Stop recognition due to silence
        }
      }, SILENCE_TIMEOUT);
    } // End of helper function // Check for Web Speech API compatibility
  
    if ("webkitSpeechRecognition" in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onstart = function () {
        console.log("Ã°Å¸Å½Â¤ Voice recognition STARTED.");
  
        micBtn.style.color = "#805AD5"; // Highlight mic button when active
        micBtn.style.animation = "bounce 0.6s infinite"; // Add a subtle bounce animation
        micBtn.dataset.listening = "true"; // Set custom attribute to indicate listening
        input.placeholder = "Listening..."; // Visual feedback for user
  
        resetSilenceTimer(); // Start the timer when recognition begins
      };
  
      recognition.onresult = function (event) {
        resetSilenceTimer(); // Reset the timer every time a result (speech) comes in
  
        let interimTranscript = "";
        let finalTranscript = "";
  
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
  
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
  
        input.value = finalTranscript || interimTranscript;
        input.scrollLeft = input.scrollWidth; // Scroll to end of input if it overflows
      };
  
      recognition.onerror = function (event) {
        console.error("Ã°Å¸Å¡Â« Speech recognition ERROR:", event.error);
  
        micBtn.style.color = "#aaa"; // Reset mic button color
        micBtn.style.animation = "none"; // Remove animation
        micBtn.dataset.listening = "false"; // Reset listening state
        input.placeholder = "Type your message..."; // Reset placeholder
  
        clearTimeout(silenceTimer); // Ensure timer is cleared on error
  
        if (event.error === "no-speech") {
          console.log(
            "No speech detected by API, or timeout reached. Recognition stopped."
          );
        } else if (event.error === "not-allowed") {
          alert(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (event.error === "aborted") {
          console.log("Speech recognition aborted (likely manual stop).");
        }
      };
  
      recognition.onend = function () {
        console.log("Ã°Å¸â€ºâ€˜ Voice recognition ENDED.");
  
        micBtn.style.color = "#aaa"; // Reset mic button color
        micBtn.style.animation = "none"; // Remove animation
        micBtn.dataset.listening = "false"; // Reset listening state
        input.placeholder = "Type your message..."; // Reset placeholder
        clearTimeout(silenceTimer); // Ensure timer is cleared when recognition ends
      };
  
      micBtn.addEventListener("click", () => {
        if (micBtn.dataset.listening === "true") {
          // Use the custom data attribute for reliable state
  
          // If currently listening, stop it
  
          console.log("User clicked mic button: Stopping recognition.");
          recognition.stop();
        } else {
          // Otherwise, start recognition
          console.log("User clicked mic button: Starting recognition.");
          input.value = ""; // Clear input on new recording session
          recognition.start();
        }
      });
    } else {
      console.warn("Ã°Å¸Å¡Â« Web Speech API is not supported in this browser.");
      micBtn.style.display = "none"; // Hide the mic button if not supported
  
      alert(
        "Your browser does not support the Web Speech API. Please use a modern browser like Chrome or Edge for voice input."
      );
    } 
    
    
    
    
    
    
    
    
    
    
    
    // ===== Message Sending Logic =====
    function sendMessage() {
        // Add a check at the beginning to prevent multiple clicks while sending
        if (sendBtn.disabled) {
            console.log("Button is disabled, preventing double click.");
            return; 
        }

        const text = input.value.trim();
      
        if (!text && attachedFiles.length === 0) return;
      
        // On first message, show message-display container and hide heading
        if (!messageDisplay.classList.contains('active')) {
          messageDisplay.classList.add('active');
          chatHeading.style.display = 'none';
        }
        // Hide heading wrapper completely
       const headingWrapper = document.getElementById("center-heading-wrapper") || document.getElementById("initial-heading");
       if (headingWrapper) headingWrapper.style.display = "none";

      // Switch to broad chat layout
      document.querySelector(".center-ui").classList.add("chat-broad");

      // Change send button icon to 'square' and disable it
      sendBtn.innerHTML = '<span class="material-symbols-outlined">square</span>';
      sendBtn.disabled = true;
      sendBtn.classList.add('sending'); // Add a class for potential styling


      
        // Create user message box and append
        const msgBox = document.createElement("div");
        msgBox.classList.add("message-box", "user-message");
        msgBox.textContent = text;
        messageDisplay.appendChild(msgBox);

        // Also display attached file previews in the message box
        if (attachedFiles.length > 0) {
          const attachmentsWrapper = document.createElement("div");
          attachmentsWrapper.classList.add("attachments-wrapper");
          attachedFiles.forEach(file => {
            const previewEl = document.createElement("div");
            previewEl.classList.add("file-preview");
            if (file.type.startsWith('image/')) {
              previewEl.classList.add("image-preview");
              const reader = new FileReader();
              reader.onload = (e) => {
                previewEl.innerHTML = `<img src="${e.target.result}" alt="${file.name}" />`;
              };
              reader.readAsDataURL(file);
            } else {
              previewEl.classList.add("file-preview");
              previewEl.innerHTML = `<span class="material-symbols-outlined file-icon">attach_file</span>`;
            }
            attachmentsWrapper.appendChild(previewEl);
          });
          msgBox.appendChild(attachmentsWrapper);
        }
      
        // Create bot reply wrapper and the bot reply message
        const botReplyWrapper = document.createElement("div");
        botReplyWrapper.classList.add("bot-reply-wrapper");
        const botReply = document.createElement("div");
        botReply.classList.add("message-box", "bot-msg",'thinking');
        const jarvisThinkingSVG = `
        <svg class="bot-thinking-logo" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="36" fill="#181825" stroke="#805ad5" stroke-width="2"/>
          <ellipse cx="60" cy="60" rx="18" ry="8" fill="#805ad5" opacity="0.45"/>
          <circle cx="60" cy="60" r="18" fill="none" stroke="#805ad5" stroke-width="2"/>
          <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#fff"
          font-family="'Dancing Script', 'Inter', Arial, sans-serif" font-size="44" font-weight="bold">J</text>
          <text x="50%" y="72%" dominant-baseline="middle" text-anchor="middle" fill="#805ad5"
          font-family="'Inter', Arial, sans-serif" font-size="24" font-weight="bold">AI</text>
        </svg>
        `;
        
        

        botReply.innerHTML = jarvisThinkingSVG;
        botReplyWrapper.appendChild(botReply);
        messageDisplay.appendChild(botReplyWrapper);
      
        const centerUI = document.querySelector(".center-ui");
        centerUI.classList.add("after-send");
      
        // Clear input, attached files and scroll to bottom initially when user sends message
        input.value = "";
        filePreviewsContainer.innerHTML = "";
        attachedFiles = [];
        messageDisplay.scrollTop = messageDisplay.scrollHeight;


  
  fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text })
  })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
        botReply.classList.remove("thinking");
      botReply.textContent = data.reply || "No response received.";
     // === Create buttons only after response arrives ===
const copyBtn = document.createElement("button");
copyBtn.classList.add("copy-btn");
copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
copyBtn.title = "Copy reply";
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(botReply.textContent).then(() => {
    copyBtn.innerHTML = "done";
    setTimeout(() => {
      copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
    }, 1500);
  });
});

const likeBtn = document.createElement("button");
likeBtn.classList.add("feedback-btn");
likeBtn.innerHTML = '<span class="material-symbols-outlined">thumb_up</span>';
likeBtn.title = "Like";
likeBtn.addEventListener("click", () => {
  likeBtn.style.color = "#4ade80";
  dislikeBtn.style.color = "#aaa";
});

const dislikeBtn = document.createElement("button");
dislikeBtn.classList.add("feedback-btn");
dislikeBtn.innerHTML = '<span class="material-symbols-outlined">thumb_down</span>';
dislikeBtn.title = "Dislike";
dislikeBtn.addEventListener("click", () => {
  dislikeBtn.style.color = "#f87171";
  likeBtn.style.color = "#aaa";
});

// Append to wrapper now
botReplyWrapper.appendChild(copyBtn);
botReplyWrapper.appendChild(likeBtn);
botReplyWrapper.appendChild(dislikeBtn);
 
      // Revert send button icon and enable it
      sendBtn.innerHTML = '<span class="material-symbols-outlined">send</span>';
      sendBtn.disabled = false;
      sendBtn.classList.remove('sending');
      // Scroll to the bottom after the bot's response is displayed
      messageDisplay.scrollTop = messageDisplay.scrollHeight;
    })
    .catch(err => {
      console.error("Error from Gemini API:", err);
      botReply.textContent = "Sorry, something went wrong. Try again later.";
      // Revert send button icon and enable it on error
      sendBtn.innerHTML = '<span class="material-symbols-outlined">send</span>';
      sendBtn.disabled = false;
      sendBtn.classList.remove('sending');
      // Also scroll to the bottom in case of an error message
      messageDisplay.scrollTop = messageDisplay.scrollHeight;
    });
      messageDisplay.appendChild(botReplyWrapper);
      messageDisplay.appendChild(botReply); // Create sidebar chat item with 3-dot menu
  
      const chatList = document.getElementById("chat-list");
      const wrapperDiv = document.createElement("div");
      wrapperDiv.classList.add("sidebar-chat-wrapper");
      const chatItem = document.createElement("li");
      chatItem.classList.add("sidebar-chat-item");
      chatItem.textContent = text;
      chatItem.setAttribute("data-message", text); // store original message
      const menuBtn = document.createElement("button");
      
      menuBtn.classList.add("chat-menu-btn");
      menuBtn.innerHTML =
        '<span class="material-symbols-outlined">more_vert</span>';
      const menuBox = document.createElement("div");
      menuBox.classList.add("chat-menu-box");
      menuBox.innerHTML = `
    <button class="rename-btn">
      <span class="material-symbols-outlined">edit</span> Rename
    </button>
    <button class="delete-btn">
      <span class="material-symbols-outlined">delete</span> Delete
    </button>
  `;
  
      menuBox.querySelector(".delete-btn").addEventListener("click", () => {
        wrapperDiv.remove();
      });
  
      const chatWrapper = document.createElement("div");
      chatWrapper.classList.add("chat-item-wrapper");
      chatWrapper.appendChild(chatItem);
      chatWrapper.appendChild(menuBtn);
      chatWrapper.appendChild(menuBox);
      wrapperDiv.appendChild(chatWrapper);
      chatList.appendChild(wrapperDiv); // Show menu on 3-dot button click
  
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Close other menus first
  
        document.querySelectorAll(".chat-menu-box").forEach((box) => {
          if (box !== menuBox) box.style.display = "none";
        });
  
        menuBox.style.display =
          menuBox.style.display === "flex" ? "none" : "flex";
      }); // Hide menus on outside click
  
      document.addEventListener("click", () => {
        document.querySelectorAll(".chat-menu-box").forEach((box) => {
          box.style.display = "none";
        });
      }); // Show sidebar + scroll
  
      document.querySelector(".prev_chats").style.display = "block";
      document.querySelector(".center-ui").classList.add("after-send");
      input.value = "";
  
      // This line is moved inside the fetch .then() and .catch() blocks
      // setTimeout(() => {
      //   messageDisplay.scrollTop = messageDisplay.scrollHeight;
      // }, 0);
  
      const renameBtn = menuBox.querySelector(".rename-btn");
      renameBtn.addEventListener("click", () => {
        const currentText = chatItem.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.className = "rename-input";
        chatWrapper.replaceChild(input, chatItem);
        input.focus();
  
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const newText = input.value.trim();
  
            if (newText !== "") {
              chatItem.textContent = newText;
  
              chatWrapper.replaceChild(chatItem, input);
            }
          } else if (e.key === "Escape") {
            chatWrapper.replaceChild(chatItem, input);
          }
        });
  
        input.addEventListener("blur", () => {
          chatWrapper.replaceChild(chatItem, input);
        });
      });
    } // Attach event listeners
  
    sendBtn.addEventListener("click", sendMessage);
  
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  
    const searchBtn = document.querySelector(".search_btn");
    const searchBoxOverlay = document.getElementById("searchBoxOverlay");
    const closeSearchBtn = document.getElementById("closeSearchBox");
    const searchResults = document.getElementById("searchResults");
    const chatList = document.getElementById("chat-list");
    const searchInput = document.getElementById("searchInput"); // Open search box from sidebar
  
    searchBtn.addEventListener("click", () => {
      searchBoxOverlay.style.display = "flex";
  
      populateSearchResults("");
    });
  
    const searchChatIconBtn = document.getElementById("searchChatIconBtn");
  
    if (searchChatIconBtn) {
      searchChatIconBtn.addEventListener("click", () => {
        searchBoxOverlay.style.display = "flex";
  
        searchInput.value = "";
  
        populateSearchResults("");
      });
    } // Close button logic
  
    closeSearchBtn.addEventListener("click", () => {
      searchBoxOverlay.style.display = "none";
    }); // Populate search results
  
    function populateSearchResults(term) {
      const allChats = chatList.querySelectorAll("li");
  
      searchResults.innerHTML = "";
      let hasMatch = false;
  
      allChats.forEach((chatItem) => {
        const text = chatItem.getAttribute("data-message").trim();
  
        if (text.toLowerCase().includes(term.toLowerCase()) || term === "") {
          const li = chatItem.cloneNode(true);
  
          li.addEventListener("click", () => {
            openSearchedChat(text);
  
            searchBoxOverlay.style.display = "none";
          });
  
          searchResults.appendChild(li);
          hasMatch = true;
        }
      });
  
      if (!hasMatch) {
        const noResult = document.createElement("li");
  
        noResult.textContent = "No results found";
        noResult.style.color = "#999";
        noResult.style.textAlign = "center";
        noResult.style.padding = "10px";
  
        searchResults.appendChild(noResult);
      }
    } // Live filter on input
  
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim();
  
      populateSearchResults(term);
    });
  });
  
  // === Sidebar Toggle & Floating Buttons ===
  
  const toggleBtn = document.getElementById("toggleSidebar");
  const sideBar = document.querySelector(".side_bar");
  const floatingButtons = document.createElement("div");
  floatingButtons.className = "floating-buttons";
  floatingButtons.innerHTML = `
  
    <button id="reopenSidebar" title="Open Sidebar">
      <span class="material-symbols-outlined">arrow_circle_right</span>
    </button>
  
    <button id="floatingNewChat" title="New Chat">
      <span class="material-symbols-outlined">edit_document</span>
    </button>
  
    <button id="floatingSearch" title="Search">
      <span class="material-symbols-outlined">search</span>
    </button>
  
  `;
  
  toggleBtn.addEventListener("click", () => {
    sideBar.classList.toggle("collapsed");
  
    const existing = document.querySelector(".floating-buttons");
    const centerUI = document.querySelector(".center-ui");
  
    if (sideBar.classList.contains("collapsed")) {
      centerUI.classList.add("sidebar-collapsed-center");
  
      if (!existing) {
        document.body.appendChild(floatingButtons); // ✅ Attach working listener for floating new chat button
  
        setTimeout(() => {
          const floatNew = document.getElementById("floatingNewChat");
  
          if (floatNew) {
            floatNew.addEventListener("click", resetChatScreen);
          }
  
          const floatSearch = document.getElementById("floatingSearch");
  
          if (floatSearch) {
            floatSearch.addEventListener("click", () => {
              searchBoxOverlay.style.display = "flex";
  
              searchInput.value = "";
  
              populateSearchResults("");
            });
          }
        }, 0);
  
        document.getElementById("reopenSidebar").addEventListener("click", () => {
          sideBar.classList.remove("collapsed");
  
          floatingButtons.remove();
          document.getElementById("sidebarIcon").innerText = "arrow_circle_left";
          centerUI.classList.remove("sidebar-collapsed-center");
        });
      }
  
      document.getElementById("sidebarIcon").innerText = "arrow_circle_right";
    } else {
      if (existing) existing.remove();
      document.getElementById("sidebarIcon").innerText = "arrow_circle_left";
      centerUI.classList.remove("sidebar-collapsed-center");
    }
  });
  
  function openSearchedChat(text) {
    const messageDisplay = document.getElementById("message-display");
    messageDisplay.innerHTML = ""; // User message
    const msgBox = document.createElement("div");
    msgBox.classList.add("message-box");
    msgBox.textContent = text;
    msgBox.style.alignSelf = "flex-end";
    messageDisplay.appendChild(msgBox); // Bot reply
    const botReply = document.createElement("div");
    botReply.classList.add("message-box", "bot-msg");
  
    if (text.toLowerCase() === "hi" || text.toLowerCase() === "hello") {
      botReply.textContent =
        "Greetings! IÃ¢â‚¬â„¢m Jarvis.AI, your personal assistant. How can I help you today?";
    } else {
      botReply.textContent = "I'm not sure how to respond to that yet.";
    }
  
    messageDisplay.appendChild(botReply);
    const centerUI = document.querySelector(".center-ui");
    centerUI.classList.add("after-send");
    centerUI.classList.remove("chat-mode");
    const chatHeading = document.getElementById("initial-heading");
    chatHeading.style.display = "none";

    // Scroll to the bottom after opening a searched chat
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
  }
  
  const wrapperDiv = document.createElement("div");
  wrapperDiv.classList.add("sidebar-chat-wrapper");
  const chatItem = document.createElement("li");
  chatItem.classList.add("sidebar-chat-item");
  chatItem.textContent = text;
  
  // Add menu button and menu
  
  const menuBtn = document.createElement("button");
  menuBtn.classList.add("chat-menu-btn");
  menuBtn.innerHTML = '<span class="material-symbols-outlined">more_vert</span>';
  const menuBox = document.createElement("div");
  menuBox.classList.add("chat-menu-box");
  menuBox.innerHTML = `
    <button class="rename-btn">Rename</button>
    <button class="delete-btn">Delete</button>
  `;
  
  const chatWrapper = document.createElement("div");
  chatWrapper.classList.add("chat-item-wrapper");
  chatWrapper.appendChild(chatItem);
  chatWrapper.appendChild(menuBtn);
  chatWrapper.appendChild(menuBox);
  wrapperDiv.appendChild(chatWrapper);
  chatList.appendChild(wrapperDiv);
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent unwanted bubbling
  
    menuBox.style.display = menuBox.style.display === "flex" ? "none" : "flex";
  });
  
  // Close all menus when clicking outside
  
  document.addEventListener("click", () => {
    document.querySelectorAll(".chat-menu-box").forEach((box) => {
      box.style.display = "none";
    });
  });