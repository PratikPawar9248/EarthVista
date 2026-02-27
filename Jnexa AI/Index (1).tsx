import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/sidebar/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput, AttachedFile } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { SmartSuggestions } from "@/components/chat/SmartSuggestions";
import { ThinkingIndicator } from "@/components/chat/ThinkingIndicator";
import { ImageStyle } from "@/components/chat/ImageStyleSelector";
import { useLocalConversations } from "@/hooks/useLocalConversations";
import { useLocalChat, ChatMode } from "@/hooks/useLocalChat";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts.tsx";
import { useAIMemory } from "@/hooks/useAIMemory";
import { useKnowledgeGraph } from "@/hooks/useKnowledgeGraph";
import { useResponseMetadata, PersonalityMode } from "@/hooks/useResponseMetadata";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gemini-2.5-flash" | "gemini-2.5-pro">("gemini-2.5-flash");

  const {
    conversations,
    createConversation,
    deleteConversation,
    updateConversationTitle,
  } = useLocalConversations();

  const { getMemoryContext, analyzeConversation, addMemory } = useAIMemory();
  const { recordSession, updateSkill } = useKnowledgeGraph();
  const { 
    preferredPersonality, 
    setPreferredPersonality, 
    vernacularMode, 
    setVernacularMode,
    parseMetadataFromResponse 
  } = useResponseMetadata();

  // Callback for when AI extracts memory from conversation
  const handleMemoryExtracted = useCallback((type: "fact" | "preference" | "context", content: string, importance: "low" | "medium" | "high") => {
    addMemory(type, content, importance);
  }, [addMemory]);

  const {
    messages,
    isStreaming,
    isGeneratingImage,
    chatMode,
    setChatMode,
    sendMessage,
    generateImage,
    stopGeneration,
  } = useLocalChat(currentConversationId, updateConversationTitle, {
    personality: preferredPersonality,
    vernacular: vernacularMode,
    memoryContext: getMemoryContext(),
    onMemoryExtracted: handleMemoryExtracted,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = useCallback(() => {
    const id = createConversation();
    setCurrentConversationId(id);
  }, [createConversation]);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [deleteConversation, currentConversationId]);

  const handleSuggestionClick = useCallback((prompt: string) => {
    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation();
      setCurrentConversationId(convId);
    }
    setTimeout(() => {
      sendMessage(prompt);
    }, 50);
  }, [currentConversationId, createConversation, sendMessage]);

  const handleSendMessage = useCallback((content: string, files?: AttachedFile[], mode?: ChatMode) => {
    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation();
      setCurrentConversationId(convId);
    }
    setTimeout(() => {
      sendMessage(content, files, mode);
    }, 50);
  }, [currentConversationId, createConversation, sendMessage]);

  const handleGenerateImage = useCallback((prompt: string, style?: ImageStyle) => {
    let convId = currentConversationId;
    if (!convId) {
      convId = createConversation();
      setCurrentConversationId(convId);
    }
    setTimeout(() => {
      generateImage(prompt, style);
    }, 50);
  }, [currentConversationId, createConversation, generateImage]);

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMessage) {
      if (lastUserMessage.content.startsWith("🎨 Generate image:")) {
        const prompt = lastUserMessage.content.replace("🎨 Generate image:", "").trim();
        generateImage(prompt);
      } else {
        sendMessage(lastUserMessage.content);
      }
    }
  }, [messages, sendMessage, generateImage]);

  // Get last messages for smart suggestions
  const { lastUserMsg, lastAssistantMsg } = useMemo(() => {
    const reversed = [...messages].reverse();
    const lastAssistant = reversed.find(m => m.role === "assistant");
    const lastUser = reversed.find(m => m.role === "user");
    return {
      lastUserMsg: lastUser?.content || "",
      lastAssistantMsg: lastAssistant?.content || "",
    };
  }, [messages]);

  const showSuggestions = messages.length >= 2 && !isStreaming && !isGeneratingImage && lastAssistantMsg;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full" />
        </div>

        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />

        <div className="flex flex-1 flex-col min-w-0 relative">
          <ChatHeader 
            onClear={handleNewChat} 
            hasMessages={messages.length > 0}
            onSignOut={signOut}
            userEmail={user.email}
            onWebSearchResult={(result) => handleSendMessage(result)}
            onImageAnalysisResult={(result) => handleSendMessage(result)}
            isProcessing={isStreaming || isGeneratingImage}
            messages={messages}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Thinking Indicator */}
          {(isStreaming || isGeneratingImage) && messages.length > 0 && messages[messages.length - 1]?.content === "" && (
            <ThinkingIndicator 
              isThinking={true} 
              mode={chatMode} 
              isGeneratingImage={isGeneratingImage} 
            />
          )}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth"
          >
            {!currentConversationId || messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
              <div className="pb-6">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    role={message.role as "user" | "assistant"}
                    content={message.content}
                    images={message.images}
                    attachedImages={message.attachedImages}
                    isStreaming={
                      (isStreaming || isGeneratingImage) &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                    }
                    onRegenerate={
                      !isStreaming &&
                      !isGeneratingImage &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                        ? handleRegenerate
                        : undefined
                    }
                  />
                ))}
                
                {/* Smart Suggestions */}
                <SmartSuggestions
                  lastUserMessage={lastUserMsg}
                  lastAssistantMessage={lastAssistantMsg}
                  onSuggestionClick={handleSuggestionClick}
                  isVisible={!!showSuggestions}
                />
              </div>
            )}
          </div>

          {/* Input Area with Enhanced Gradient */}
          <div className="relative">
            <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            <div className="relative border-t border-border/30 bg-background/80 backdrop-blur-2xl p-3 md:p-4">
              <div className="mx-auto max-w-3xl">
                <ChatInput 
                  onSend={handleSendMessage} 
                  isLoading={isStreaming}
                  onStop={stopGeneration}
                  onGenerateImage={handleGenerateImage}
                  isGeneratingImage={isGeneratingImage}
                  chatMode={chatMode}
                  onModeChange={setChatMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
