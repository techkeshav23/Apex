import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Color Palette
const COLORS = {
  // Backgrounds
  pureWhite: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F5F5F5',
  
  // Blacks and Grays
  pureBlack: '#000000',
  darkBlack: '#0A0A0A',
  softBlack: '#1A1A1A',
  mediumGray: '#404040',
  lightText: '#8E8E8E',
  
  // Accents
  primaryTeal: '#00F0FF',
  accentPurple: '#6C63FF',
  accentPink: '#FF6B9D',
  successGreen: '#10B981',
  warningOrange: '#F59E0B',
};


// ============================================
// APEX AI CHATBOT COMPONENTS
// ============================================
const QuickReply = ({ options, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReplyScroll}>
      <View style={styles.quickReplyContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReplyButton}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickReplyText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const ChatProductCard = ({ product, onAddToCart }) => {
  return (
    <TouchableOpacity style={styles.chatProductCard} activeOpacity={0.9}>
      <Image source={{ uri: product.image }} style={styles.chatProductImage} resizeMode="contain" />
      <View style={styles.chatProductInfo}>
        <Text style={styles.chatProductCategory}>{product.category}</Text>
        <Text style={styles.chatProductTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.chatProductRating}>
          <Text style={styles.ratingStars}>⭐</Text>
          <Text style={styles.ratingText}>{product.rating?.rate || 4.5}</Text>
        </View>
        <Text style={styles.chatProductPrice}>${product.price}</Text>
        <TouchableOpacity
          style={styles.chatAddToCartButton}
          onPress={() => onAddToCart(product)}
          activeOpacity={0.8}
        >
          <Text style={styles.chatAddToCartText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const UserMessage = ({ message }) => {
  return (
    <View style={styles.userMessageContainer}>
      <View style={styles.userBubble}>
        <Text style={styles.userMessageText}>{message}</Text>
      </View>
    </View>
  );
};

const BotMessage = ({ message, product, quickReplies, onAddToCart, onQuickReply }) => {
  return (
    <View style={styles.botMessageContainer}>
      <View style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>AI</Text>
      </View>
      <View style={styles.botContent}>
        {message && (
          <View style={styles.botBubble}>
            <Text style={styles.botMessageText}>{message}</Text>
          </View>
        )}
        {product && <ChatProductCard product={product} onAddToCart={onAddToCart} />}
        {quickReplies && <QuickReply options={quickReplies} onSelect={onQuickReply} />}
      </View>
    </View>
  );
};

// ============================================
// APEX AI MODAL
// ============================================
const ApexAIModal = ({ visible, onClose, cart, onAddToCart, products, onClearCart, onNavigateToCategory, onSearchProducts }) => {
  const flatListRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      message: "👋 Hello! I'm Apex, your intelligent AI shopping assistant.\n\n🎯 I have full control over your shopping experience:\n\n✨ Find & recommend products\n💰 Show you best deals\n� Manage your cart\n🔍 Search & filter items\n📊 Track your spending\n🎁 Suggest gift ideas\n\nWhat would you like me to help you with?",
      quickReplies: ['Show all products', 'Best deals', 'Manage my cart', 'Help me find something'],
    },
  ]);



  const processBackendResponse = (data) => {
    // Sync cart if provided by backend
    if (data.cart) {
      const mappedCart = data.cart.map(p => ({
        id: p.sku,
        title: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        image: p.image_url || (p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/150'),
        quantity: p.quantity
      }));
      setCart(mappedCart);
    }

    // Map backend product to frontend format
    let product = null;
    if (data.recommendations && data.recommendations.length > 0) {
      const p = data.recommendations[0];
      product = {
        id: p.sku,
        title: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        image: p.image_url || (p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/150'),
        rating: { rate: 4.5, count: 10 }
      };
    }

    return {
      message: data.message,
      product: product,
      quickReplies: ['Show more', 'Price under 1000', 'Different color']
    };
  };

  const sendMessageToBackend = async (text) => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: text
        })
      });
      const data = await response.json();
      return processBackendResponse(data);
    } catch (error) {
      console.error("Chat error:", error);
      return { message: "Sorry, I'm having trouble connecting to the server." };
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const text = inputText.trim();
    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: text,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    const response = await sendMessageToBackend(text);
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      ...response,
    };
    setMessages((prev) => [...prev, botResponse]);
  };

  const handleQuickReply = async (reply) => {
    const userReply = {
      id: Date.now().toString(),
      type: 'user',
      message: reply,
    };
    setMessages((prev) => [...prev, userReply]);

    const response = await sendMessageToBackend(reply);
    const botResponse = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      ...response,
    };
    setMessages((prev) => [...prev, botResponse]);
  };

  const renderMessage = ({ item }) => {
    if (item.type === 'user') {
      return <UserMessage message={item.message} />;
    }
    return (
      <BotMessage
        message={item.message}
        product={item.product}
        quickReplies={item.quickReplies}
        onAddToCart={onAddToCart}
        onQuickReply={handleQuickReply}
      />
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#12182B" />
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.apexHeader}>
            <View style={styles.apexHeaderLeft}>
              <View style={styles.apexLogo}>
                <Image 
                  source={require('./assets/Logo.png')} 
                  style={styles.apexLogoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.apexHeaderTitle}>Apex Agent</Text>
                <View style={styles.apexHeaderSubtitleContainer}>
                  <Image 
                    source={require('./assets/Logo.png')} 
                    style={styles.apexHeaderSubtitleLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.apexHeaderSubtitle}>Smart Shopping</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask Apex anything..."
              placeholderTextColor="#A9B2C9"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.7}>
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================
// MAIN SCREEN COMPONENTS
// ============================================
const ProductCard = ({ product, onAddToCart, onPress }) => {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
        {product.rating?.rate >= 4.5 && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥 HOT</Text>
          </View>
        )}
      </View>
      <View style={styles.productDetails}>
        <Text style={styles.productCategory}>{product.category?.toUpperCase()}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStars}>⭐</Text>
          <Text style={styles.ratingValue}>{product.rating?.rate || 4.5}</Text>
          <Text style={styles.ratingCount}>({product.rating?.count || 0})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${product.price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CategoryChip = ({ category, isSelected, onPress }) => {
  const categoryIcons = {
    'all': 'grid',
    'electronics': 'laptop',
    'jewelery': 'diamond',
    "men's clothing": 'shirt',
    "women's clothing": 'woman',
  };

  const icon = categoryIcons[category.toLowerCase()] || 'pricetag';

  return (
    <TouchableOpacity
      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={isSelected ? COLORS.pureWhite : COLORS.pureBlack} 
        style={styles.categoryIcon}
      />
      <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================
// CATEGORIES SCREEN COMPONENT
// ============================================
const CategoriesScreen = ({ categories, selectedCategory, onSelectCategory, onGoToProducts }) => {
  const categoryData = [
    { id: 'all', name: 'All Products', icon: 'grid-outline', color: '#000000' },
    { id: 'electronics', name: 'Electronics', icon: 'laptop-outline', color: '#3B82F6' },
    { id: 'jewelery', name: 'Jewelry', icon: 'diamond-outline', color: '#F59E0B' },
    { id: "men's clothing", name: "Men's Clothing", icon: 'shirt-outline', color: '#10B981' },
    { id: "women's clothing", name: "Women's Clothing", icon: 'woman-outline', color: '#EC4899' },
  ];

  return (
    <ScrollView style={styles.categoriesScreenContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.categoriesScreenHeader}>
        <Text style={styles.categoriesScreenTitle}>Categories</Text>
        <Text style={styles.categoriesScreenSubtitle}>Browse by category</Text>
      </View>
      
      <View style={styles.categoriesGrid}>
        {categoryData.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryCard,
              selectedCategory === cat.id && styles.categoryCardActive
            ]}
            onPress={() => {
              onSelectCategory(cat.id);
              onGoToProducts();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryCardIcon, { backgroundColor: cat.color + '20' }]}>
              <Ionicons name={cat.icon} size={32} color={cat.color} />
            </View>
            <Text style={styles.categoryCardName}>{cat.name}</Text>
            {selectedCategory === cat.id && (
              <View style={styles.categoryCardCheck}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.pureBlack} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// ============================================
// ACCOUNT SCREEN COMPONENT
// ============================================
const AccountScreen = () => {
  const menuItems = [
    { id: 1, title: 'My Orders', icon: 'receipt-outline', color: '#3B82F6' },
    { id: 2, title: 'My Wishlist', icon: 'heart-outline', color: '#EC4899' },
    { id: 3, title: 'Addresses', icon: 'location-outline', color: '#10B981' },
    { id: 4, title: 'Payment Methods', icon: 'card-outline', color: '#F59E0B' },
    { id: 5, title: 'Settings', icon: 'settings-outline', color: '#6366F1' },
    { id: 6, title: 'Help & Support', icon: 'help-circle-outline', color: '#8B5CF6' },
  ];

  return (
    <ScrollView style={styles.accountContainer} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.accountHeader}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person" size={40} color={COLORS.pureWhite} />
        </View>
        <Text style={styles.accountName}>Guest User</Text>
        <Text style={styles.accountEmail}>guest@apexshop.com</Text>
        <TouchableOpacity style={styles.editProfileButton} activeOpacity={0.8}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.accountMenuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.accountMenuItem}
            onPress={() => alert(`${item.title} coming soon!`)}
            activeOpacity={0.7}
          >
            <View style={[styles.accountMenuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.accountMenuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.pureWhite} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />
    </ScrollView>
  );
};

// ============================================
// CART SCREEN COMPONENT
// ============================================
const CartScreen = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onBackToShopping, onCheckout }) => {
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <View style={styles.emptyCartContent}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Looks like you haven't added anything to your cart yet
          </Text>
          <TouchableOpacity 
            style={styles.continueShopping} 
            onPress={onBackToShopping}
            activeOpacity={0.8}
          >
            <Text style={styles.continueShoppingText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cartScreenContainer}>
      {/* Cart Header */}
      <View style={styles.cartScreenHeader}>
        <Text style={styles.cartScreenTitle}>Shopping Cart</Text>
        <Text style={styles.cartScreenSubtitle}>{cartCount} items</Text>
      </View>

      {/* Cart Items List */}
      <ScrollView 
        style={styles.cartItemsScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartItemsContent}
      >
        {cart.map((item) => (
          <View key={item.id} style={styles.cartScreenItem}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.cartScreenItemImage} 
              resizeMode="contain" 
            />
            <View style={styles.cartScreenItemInfo}>
              <Text style={styles.cartScreenItemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cartScreenItemCategory}>
                {item.category}
              </Text>
              <Text style={styles.cartScreenItemPrice}>
                ${item.price.toFixed(2)}
              </Text>
              
              {/* Quantity Controls */}
              <View style={styles.cartScreenQuantityControls}>
                <TouchableOpacity 
                  style={styles.cartScreenQuantityButton}
                  onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cartScreenQuantityButtonText}>−</Text>
                </TouchableOpacity>
                <View style={styles.cartScreenQuantityDisplay}>
                  <Text style={styles.cartScreenQuantityText}>{item.quantity}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.cartScreenQuantityButton}
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cartScreenQuantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Remove Button */}
            <TouchableOpacity 
              style={styles.cartScreenRemoveButton}
              onPress={() => onRemoveItem(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.cartScreenRemoveButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Clear Cart Button */}
        <TouchableOpacity 
          style={styles.clearCartButton}
          onPress={onClearCart}
          activeOpacity={0.8}
        >
          <Text style={styles.clearCartButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Cart Footer with Total */}
      <View style={styles.cartScreenFooter}>
        <View style={styles.cartScreenTotalSection}>
          <View style={styles.cartScreenTotalRow}>
            <Text style={styles.cartScreenTotalLabel}>Subtotal</Text>
            <Text style={styles.cartScreenTotalValue}>${cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.cartScreenTotalRow}>
            <Text style={styles.cartScreenTotalLabel}>Shipping</Text>
            <Text style={styles.cartScreenTotalValue}>Free</Text>
          </View>
          <View style={[styles.cartScreenTotalRow, styles.cartScreenGrandTotalRow]}>
            <Text style={styles.cartScreenGrandTotalLabel}>Total</Text>
            <Text style={styles.cartScreenGrandTotal}>${cartTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.cartCheckoutButton}
          onPress={onCheckout}
          activeOpacity={0.8}
        >
          <Text style={styles.cartCheckoutButtonText}>Proceed to Checkout</Text>
          <Text style={styles.cartCheckoutArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================
// MAIN APP
// ============================================
// Replace with your PC's IP address if running on a real device
const API_URL = 'http://10.0.2.2:5000'; 

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [apexVisible, setApexVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['all']);
  const [cartVisible, setCartVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'cart', 'categories', 'search', or 'account'
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Fetch products from API
  useEffect(() => {
    startSession();
    fetchProducts();
  }, []);

  const startSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/start_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: 'CUST001',
          channel: 'mobile'
        })
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.session_id);
        console.log('Session started:', data.session_id);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      // Map backend product format to frontend format if needed
      // Backend: { sku, name, price, category, description, images, ... }
      // Frontend expects: { id, title, price, category, description, image, ... }
      const mappedProducts = data.map(p => ({
        id: p.sku,
        title: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        image: p.image_url || (p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/150'),
        rating: { rate: 4.5, count: 10 } // Mock rating
      }));
      
      setProducts(mappedProducts);
      
      // Extract categories
      const uniqueCategories = ['all', ...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to fake store if backend fails
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        console.error('Fallback failed', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Categories are now derived from products
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNavigateToCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Search filtered products
  const searchFilteredProducts = searchQuery.trim() === ''
    ? filteredProducts
    : filteredProducts.filter((p) => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    alert('Checkout functionality coming soon!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.pureWhite} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryTeal} />
          <Text style={styles.loadingText}>Loading amazing products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.pureWhite} />
      
      {/* Header with Search, Scanner, Camera */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('./assets/Logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Apex</Text>
            </View>
          </View>
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setCurrentScreen('search')}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={22} color={COLORS.pureBlack} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => setShowScanner(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="scan-outline" size={22} color={COLORS.pureBlack} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => alert('Camera feature coming soon!')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={22} color={COLORS.pureBlack} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Conditional Screen Rendering */}
      {currentScreen === 'cart' ? (
        <CartScreen
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onBackToShopping={() => setCurrentScreen('home')}
          onCheckout={handleCheckout}
        />
      ) : currentScreen === 'account' ? (
        <AccountScreen />
      ) : currentScreen === 'categories' ? (
        <CategoriesScreen
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onGoToProducts={() => setCurrentScreen('home')}
        />
      ) : currentScreen === 'search' ? (
        <>
          {/* Search Screen */}
          <View style={styles.searchScreenContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={COLORS.mediumGray} style={styles.searchInputIcon} />
              <TextInput
                style={styles.searchScreenInput}
                placeholder="Search products..."
                placeholderTextColor={COLORS.mediumGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
                </TouchableOpacity>
              )}
            </View>
            
            {searchQuery.trim() === '' ? (
              <View style={styles.searchEmptyState}>
                <Ionicons name="search-outline" size={80} color={COLORS.lightGray} />
                <Text style={styles.searchEmptyTitle}>Search Products</Text>
                <Text style={styles.searchEmptySubtitle}>
                  Find electronics, jewelry, clothing and more
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchFilteredProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onAddToCart={handleAddToCart}
                    onPress={() => {}}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productsGrid}
                columnWrapperStyle={styles.productRow}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.searchEmptyState}>
                    <Ionicons name="sad-outline" size={80} color={COLORS.lightGray} />
                    <Text style={styles.searchEmptyTitle}>No Results Found</Text>
                    <Text style={styles.searchEmptySubtitle}>
                      Try searching with different keywords
                    </Text>
                  </View>
                }
                ListFooterComponent={<View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />}
              />
            )}
          </View>
        </>
      ) : (
        <>
          {/* Home Screen */}
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {categories.map((cat) => (
                <CategoryChip
                  key={cat}
                  category={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  isSelected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onAddToCart={handleAddToCart}
                onPress={() => {}}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />}
          />
        </>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setCurrentScreen('home')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={currentScreen === 'home' ? "home" : "home-outline"} 
            size={24} 
            color={currentScreen === 'home' ? COLORS.pureBlack : COLORS.mediumGray} 
          />
          <Text style={[styles.bottomNavText, currentScreen === 'home' && styles.bottomNavTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setCurrentScreen('categories')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={currentScreen === 'categories' ? "apps" : "apps-outline"} 
            size={24} 
            color={currentScreen === 'categories' ? COLORS.pureBlack : COLORS.mediumGray} 
          />
          <Text style={[styles.bottomNavText, currentScreen === 'categories' && styles.bottomNavTextActive]}>
            Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setApexVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.apexNavIcon}>
            <Image 
              source={require('./assets/Logo.png')} 
              style={styles.apexNavIconLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bottomNavTextWithLogo}>
            
            <Text style={styles.bottomNavText}>Apex Agent</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setCurrentScreen('cart')}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons 
              name={currentScreen === 'cart' ? "cart" : "cart-outline"} 
              size={24} 
              color={currentScreen === 'cart' ? COLORS.pureBlack : COLORS.mediumGray} 
            />
            {cartCount > 0 && (
              <View style={styles.bottomNavBadge}>
                <Text style={styles.bottomNavBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavText, currentScreen === 'cart' && styles.bottomNavTextActive]}>
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomNavItem}
          onPress={() => setCurrentScreen('account')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={currentScreen === 'account' ? "person" : "person-outline"} 
            size={24} 
            color={currentScreen === 'account' ? COLORS.pureBlack : COLORS.mediumGray} 
          />
          <Text style={[styles.bottomNavText, currentScreen === 'account' && styles.bottomNavTextActive]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Apex Agent Button */}
      <TouchableOpacity 
        style={styles.floatingAgentButton}
        onPress={() => setApexVisible(true)}
        activeOpacity={0.9}
      >
        <View style={styles.floatingAgentPulse}>
          <View style={styles.floatingAgentInner}>
            <Image 
              source={require('./assets/Logo.png')} 
              style={styles.floatingAgentLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Apex Agent Modal */}
      <ApexAIModal
        visible={apexVisible}
        onClose={() => setApexVisible(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        products={products}
        onClearCart={handleClearCart}
        onNavigateToCategory={handleNavigateToCategory}
        sessionId={sessionId}
        apiUrl={API_URL}
      />
    </SafeAreaView>
  );
};

 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.grayText,
  },
  
  // Header
  headerGradient: {
    backgroundColor: COLORS.pureWhite,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.pureWhite,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.pureBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  logoImage: {
    width: 30,
    height: 30,
    tintColor: COLORS.pureWhite,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    letterSpacing: 0.3,
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Navigation Tabs
  navTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  navTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navTabActive: {
    backgroundColor: COLORS.pureBlack,
  },
  navTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  navTabTextActive: {
    color: COLORS.pureWhite,
  },
  navCartBadge: {
    marginLeft: 6,
    backgroundColor: COLORS.pureWhite,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  navCartBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  
  cartButton: {
    position: 'relative',
  },
  cartIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.pureBlack,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.pureWhite,
  },
  cartBadgeText: {
    color: COLORS.pureWhite,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Cart Dropdown
  cartDropdown: {
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cartDropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 12,
  },
  cartItemsList: {
    maxHeight: 250,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureBlack,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureBlack,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: 'bold',
  },
  cartDropdownFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.lightGray,
  },
  cartDropdownTotalLabel: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  cartDropdownTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },

  // Hero Banner
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.pureWhite,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.pureBlack,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.pureBlack,
    fontSize: 16,
  },

  // Categories
  categoriesSection: {
    paddingLeft: 16,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: COLORS.offWhite,
  },
  categoriesScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.pureBlack,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    marginRight: 0,
  },
  categoryText: {
    color: COLORS.mediumGray,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.pureWhite,
    fontWeight: '700',
  },

  // Products Grid
  productsGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 18,
    width: '48%',
    overflow: 'hidden',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  productImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  trendingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.pureBlack,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },
  productDetails: {
    padding: 14,
  },
  productCategory: {
    fontSize: 10,
    color: COLORS.pureBlack,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pureBlack,
    marginBottom: 8,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingStars: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 13,
    color: COLORS.pureBlack,
    fontWeight: '600',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 11,
    color: COLORS.mediumGray,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  addButton: {
    backgroundColor: COLORS.pureBlack,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: COLORS.pureWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Floating Apex Button
  apexFloatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: COLORS.pureBlack,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  apexFloatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apexFloatingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.pureWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  apexFloatingIconText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  apexFloatingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },
  apexFloatingSubtitle: {
    fontSize: 11,
    color: COLORS.pureWhite,
    opacity: 0.9,
  },
  apexPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.pureWhite,
  },

  // Cart Summary
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.pureWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  cartSummaryLeft: {
    flex: 1,
  },
  cartSummaryCount: {
    color: COLORS.mediumGray,
    fontSize: 13,
    marginBottom: 2,
    fontWeight: '500',
  },
  cartSummaryTotal: {
    color: COLORS.pureBlack,
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: COLORS.pureBlack,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  checkoutArrow: {
    fontSize: 18,
    color: COLORS.pureWhite,
    fontWeight: 'bold',
  },

  // Apex Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  apexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.pureWhite,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  apexHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apexLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.pureBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  apexLogoImage: {
    width: 40,
    height: 40,
    tintColor: COLORS.pureWhite,
  },
  apexLogoText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },
  apexHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  apexHeaderSubtitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  apexHeaderSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  apexHeaderSubtitleLogo: {
    width: 14,
    height: 14,
    marginRight: 4,
    tintColor: COLORS.pureWhite,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.pureBlack,
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Chat
  chatContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: COLORS.pureBlack,
    borderRadius: 20,
    borderTopRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '75%',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  userMessageText: {
    color: COLORS.pureWhite,
    fontSize: 15,
    lineHeight: 22,
  },
  botMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.softBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  botAvatarText: {
    fontSize: 18,
  },
  botContent: {
    flex: 1,
    maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  botMessageText: {
    color: COLORS.pureBlack,
    fontSize: 15,
    lineHeight: 22,
  },

  // Chat Product Card
  chatProductCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  chatProductImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.lightGray,
    padding: 20,
  },
  chatProductInfo: {
    padding: 16,
  },
  chatProductCategory: {
    fontSize: 11,
    color: COLORS.pureBlack,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chatProductTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pureBlack,
    marginBottom: 8,
  },
  chatProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.pureBlack,
    marginLeft: 4,
    fontWeight: '600',
  },
  chatProductPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 12,
  },
  chatAddToCartButton: {
    backgroundColor: COLORS.pureBlack,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chatAddToCartText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: '700',
  },

  // Quick Replies
  quickReplyScroll: {
    marginTop: 4,
  },
  quickReplyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: COLORS.pureWhite,
    borderWidth: 2,
    borderColor: COLORS.pureBlack,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: 8,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickReplyText: {
    color: COLORS.pureBlack,
    fontSize: 13,
    fontWeight: '600',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: COLORS.pureWhite,
    alignItems: 'flex-end',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: COLORS.pureBlack,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.pureBlack,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonText: {
    color: COLORS.pureWhite,
    fontSize: 24,
    fontWeight: 'bold',
  },

  // ============================================
  // CART SCREEN STYLES
  // ============================================
  
  // Empty Cart
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: 40,
  },
  emptyCartContent: {
    alignItems: 'center',
  },
  emptyCartIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 12,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  continueShopping: {
    backgroundColor: COLORS.pureBlack,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueShoppingText: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Cart Screen with Items
  cartScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  cartScreenHeader: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cartScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 4,
  },
  cartScreenSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  cartItemsScrollView: {
    flex: 1,
  },
  cartItemsContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartScreenItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cartScreenItemImage: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    marginRight: 16,
  },
  cartScreenItemInfo: {
    flex: 1,
  },
  cartScreenItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.pureBlack,
    marginBottom: 6,
    lineHeight: 20,
  },
  cartScreenItemCategory: {
    fontSize: 12,
    color: COLORS.mediumGray,
    textTransform: 'capitalize',
    marginBottom: 8,
    fontWeight: '500',
  },
  cartScreenItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 12,
  },
  cartScreenQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartScreenQuantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartScreenQuantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  cartScreenQuantityDisplay: {
    marginHorizontal: 16,
    minWidth: 30,
    alignItems: 'center',
  },
  cartScreenQuantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
  },
  cartScreenRemoveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartScreenRemoveButtonText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: 'bold',
  },
  clearCartButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearCartButtonText: {
    color: COLORS.mediumGray,
    fontSize: 15,
    fontWeight: '600',
  },
  cartScreenFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.pureWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cartScreenTotalSection: {
    marginBottom: 16,
  },
  cartScreenTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartScreenTotalLabel: {
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  cartScreenTotalValue: {
    fontSize: 15,
    color: COLORS.pureBlack,
    fontWeight: '600',
  },
  cartScreenGrandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cartScreenGrandTotalLabel: {
    fontSize: 18,
    color: COLORS.pureBlack,
    fontWeight: 'bold',
  },
  cartScreenGrandTotal: {
    fontSize: 24,
    color: COLORS.pureBlack,
    fontWeight: 'bold',
  },
  cartCheckoutButton: {
    backgroundColor: COLORS.pureBlack,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cartCheckoutButtonText: {
    color: COLORS.pureWhite,
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cartCheckoutArrow: {
    color: COLORS.pureWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ============================================
  // CATEGORIES SCREEN
  // ============================================
  categoriesScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
  },
  categoriesScreenHeader: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  categoriesScreenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 4,
  },
  categoriesScreenSubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  categoriesGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: COLORS.pureWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  categoryCardActive: {
    borderWidth: 2,
    borderColor: COLORS.pureBlack,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  categoryCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCardName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.pureBlack,
    flex: 1,
  },
  categoryCardCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  // ============================================
  // BOTTOM NAVIGATION
  // ============================================
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.pureWhite,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  bottomNavText: {
    fontSize: 10,
    color: COLORS.mediumGray,
    marginTop: 4,
    fontWeight: '600',
  },
  bottomNavTextActive: {
    color: COLORS.pureBlack,
    fontWeight: '700',
  },
  bottomNavBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: COLORS.pureBlack,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  bottomNavBadgeText: {
    color: COLORS.pureWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  apexNavIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.pureBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apexNavIconLogo: {
    width: 18,
    height: 18,
    tintColor: COLORS.pureWhite,
  },
  apexNavIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },
  bottomNavTextWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bottomNavLogoSmall: {
    width: 10,
    height: 10,
    marginRight: 4,
    tintColor: COLORS.lightText,
  },

  // ============================================
  // SEARCH SCREEN
  // ============================================
  searchScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInputIcon: {
    marginRight: 10,
  },
  searchScreenInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.pureBlack,
  },
  searchEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  searchEmptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginTop: 20,
    marginBottom: 8,
  },
  searchEmptySubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ============================================
  // APEX HEADER ICON
  // ============================================
  apexHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.pureBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apexHeaderIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.pureWhite,
  },

  // ============================================
  // ACCOUNT SCREEN
  // ============================================
  accountContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  accountHeader: {
    backgroundColor: COLORS.pureWhite,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.pureBlack,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 15,
    color: COLORS.mediumGray,
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: COLORS.pureBlack,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editProfileButtonText: {
    color: COLORS.pureWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  accountMenuSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  accountMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pureWhite,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountMenuIcon: {
    marginRight: 16,
  },
  accountMenuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.pureBlack,
  },
  logoutButton: {
    backgroundColor: COLORS.pureWhite,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 100,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },

  // ============================================
  // FLOATING AGENT BUTTON
  // ============================================
  floatingAgentButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingAgentPulse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  floatingAgentInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.pureBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAgentLabel: {
    marginTop: 8,
    backgroundColor: COLORS.pureBlack,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: COLORS.pureBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingAgentLabelLogo: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: COLORS.pureWhite,
  },
  floatingAgentLabelText: {
    color: COLORS.pureWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingAgentLogo: {
    width: 28,
    height: 28,
    tintColor: COLORS.pureWhite,
  },
});

export default App;
