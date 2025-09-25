// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";  
// import { Badge } from "@/components/ui/badge";
// import { Heart, ArrowRight, Star, Clock, MapPin, Sparkles, Filter, Search, ChevronUp, ChevronDown, Send } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "@/components/Sidebar";

// const PreferencesChat = () => {
//   const navigate = useNavigate();
//   const [selectedCategory, setSelectedCategory] = useState("Manali: Attractions");
//   const [selectedExperiences, setSelectedExperiences] = useState<string[]>(["solang-valley"]);
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [inputValue, setInputValue] = useState("");
  
//   // Get trip data from localStorage or Chat component
//   const [tripData, setTripData] = useState({
//     destination: 'Manali',
//     from: 'Ahmedabad',
//     duration: '5 days',
//     travelTime: 'October',
//     travelers: 1,
//     preferences: []
//   });

//   // Chat messages for this page
//   const [messages, setMessages] = useState([
//     {
//       type: "user",
//       content: "Vibe Preference!",
//       timestamp: new Date()
//     },
//     {
//       type: "ai",
//       content: `Perfect! Based on your ${tripData.destination} trip for ${tripData.duration} in ${tripData.travelTime}, I've curated some amazing experiences. Let me know what catches your interest!`,
//       timestamp: new Date()
//     }
//   ]);

//   useEffect(() => {
//     // Load trip data from localStorage if available
//     const savedTripData = localStorage.getItem('tripData');
//     if (savedTripData) {
//       const parsedData = JSON.parse(savedTripData);
//       setTripData(parsedData);
      
//       // Update welcome message with actual trip data
//       setMessages(prev => prev.map((msg, index) => 
//         index === 1 ? {
//           ...msg,
//           content: `Perfect! Based on your ${parsedData.destination || 'destination'} trip for ${parsedData.duration || '5 days'} in ${parsedData.travelTime || 'October'}, I've curated some amazing experiences. Let me know what catches your interest!`
//         } : msg
//       ));
//     }
//   }, []);

//   const categories = [
//     `${tripData.destination}: Attractions`,
//     `${tripData.destination}: Day Trips`, 
//     `${tripData.destination}: Hidden Gems`,
//     `${tripData.destination}: Food & Cafes`
//   ];

//   const experiences = [
//     {
//       id: "solang-valley",
//       title: "Solang Valley",
//       description: "Adventure hub for paragliding, zorbing, and breathtaking mountain views.",
//       image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Attractions`,
//       rating: 4.8,
//       duration: "4-6 hours",
//       price: "₹500-1500",
//       tags: ["Adventure", "Scenic", "Photography"]
//     },
//     {
//       id: "hadimba-temple", 
//       title: "Hadimba Devi Temple",
//       description: "A unique, ancient temple set amidst cedar forests, famed for its wooden architecture.",
//       image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Attractions`,
//       rating: 4.6,
//       duration: "1-2 hours",
//       price: "Free",
//       tags: ["Spiritual", "Architecture", "Nature"]
//     },
//     {
//       id: "old-manali",
//       title: "Old Manali", 
//       description: "Charming village vibe with cozy cafes, indie shops, and riverside walks.",
//       image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Attractions`,
//       rating: 4.7,
//       duration: "Half day",
//       price: "₹200-800",
//       tags: ["Cafes", "Shopping", "Culture"]
//     },
//     {
//       id: "manu-temple",
//       title: "Manu Temple",
//       description: "Sacred site dedicated to sage Manu, offering spiritual ambiance and mountain views.",
//       image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Attractions`,
//       rating: 4.3,
//       duration: "1-2 hours",
//       price: "Free",
//       tags: ["Spiritual", "Culture", "Scenic"]
//     },
//     {
//       id: "vashisht-springs",
//       title: "Vashisht Hot Springs",
//       description: "Natural hot water baths with mountain views, perfect for relaxation.",
//       image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80", 
//       category: `${tripData.destination}: Attractions`,
//       rating: 4.5,
//       duration: "2-3 hours",
//       price: "₹50-200",
//       tags: ["Relaxation", "Wellness", "Nature"]
//     },
//     {
//       id: "rohtang-pass",
//       title: "Rohtang Pass",
//       description: "High-altitude mountain pass offering stunning views and snow activities.",
//       image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Day Trips`,
//       rating: 4.9,
//       duration: "Full day",
//       price: "₹2000-4000",
//       tags: ["Adventure", "Snow", "Scenic"]
//     },
//     {
//       id: "manikaran",
//       title: "Manikaran",
//       description: "Sacred town famous for hot springs, gurudwara, and natural beauty.",
//       image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&q=80",
//       category: `${tripData.destination}: Day Trips`,
//       rating: 4.4,
//       duration: "4-6 hours",
//       price: "₹300-800",
//       tags: ["Spiritual", "Hot Springs", "Culture"]
//     }
//   ];

//   const toggleExperience = (experienceId: string) => {
//     setSelectedExperiences(prev => 
//       prev.includes(experienceId)
//         ? prev.filter(id => id !== experienceId)
//         : [...prev, experienceId]
//     );
//   };

//   const filteredExperiences = experiences.filter(exp => exp.category === selectedCategory);

//   const handleSendMessage = () => {
//     if (inputValue.trim()) {
//       setMessages(prev => [...prev, {
//         type: "user",
//         content: inputValue,
//         timestamp: new Date()
//       }]);
      
//       // Simple AI response
//       setTimeout(() => {
//         setMessages(prev => [...prev, {
//           type: "ai",
//           content: "I understand! Feel free to select the experiences that interest you most, and I'll incorporate them into your itinerary.",
//           timestamp: new Date()
//         }]);
//       }, 1000);
      
//       setInputValue("");
//     }
//   };

//   const handleCollapseToggle = () => {
//     if (isExpanded) {
//       // If currently expanded and user clicks to collapse, navigate to /chat
//       navigate("/chat");
//     } else {
//       // If currently collapsed and user clicks to expand, just expand
//       setIsExpanded(true);
//     }
//   };

//   const handlePreferencesComplete = () => {
//     // Save preferences to trip data
//     const updatedTripData = {
//       ...tripData,
//       preferences: selectedExperiences
//     };
    
//     localStorage.setItem('tripData', JSON.stringify(updatedTripData));
    
//     // Add confirmation messages
//     setMessages(prev => [...prev, 
//       { 
//         type: "user", 
//         content: "I've selected my preferences!", 
//         timestamp: new Date() 
//       },
//       { 
//         type: "ai", 
//         content: `Excellent choices! I've noted your preferences for ${selectedExperiences.length} experiences. Now let's finalize your destinations and create your complete itinerary.`, 
//         timestamp: new Date() 
//       }
//     ]);
    
//     // Navigate to destinations after a brief delay
//     setTimeout(() => {
//       navigate("/destinations");
//     }, 2000);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
//       <div className="w-full max-w-4xl mx-auto px-4 pt-6">
//         <Sidebar />
        
//         {/* Chat Messages */}
//         <div className="space-y-6 mb-8">
//           {messages.map((message, index) => (
//             <div key={index}>
//               {message.type === 'ai' ? (
//                 <div className="flex gap-3 items-start">
//                   <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
//                     <span className="text-white text-sm font-bold">A</span>
//                   </div>
//                   <div className="flex-1">
//                     <div className="mb-1">
//                       <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Travion</span>
//                     </div>
//                     <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
//                       <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line">
//                         {message.content}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex gap-3 items-start">
//                   <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
//                     <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">U</span>
//                   </div>
//                   <div className="flex-1">
//                     <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 max-w-xs">
//                       <p className="text-slate-900 dark:text-slate-100 text-sm font-medium">
//                         {message.content}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Preferences Section */}
//           <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
            
//             {/* Collapsible Header */}
//             <div className="p-4 border-b border-slate-200 dark:border-slate-700">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Select your vibe</h3>
//                 </div>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   onClick={handleCollapseToggle}
//                   className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
//                 >
//                   {isExpanded ? 'Collapse' : 'Expand'}
//                   {isExpanded ? (
//                     <ChevronUp className="w-4 h-4 ml-1" />
//                   ) : (
//                     <ChevronDown className="w-4 h-4 ml-1" />
//                   )}
//                 </Button>
//               </div>
              
//               {isExpanded && (
//                 <div className="mt-4">
//                   <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
//                     Pick What You Love 
//                     <Heart className="w-5 h-5 text-red-500 fill-red-500" />
//                   </h4>
//                   <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
//                     <Heart className="w-4 h-4 text-red-500 fill-red-500" />
//                     Follow your inspiration — Travion will connect the dots and create a journey filled with moments that feel just right.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Expandable Content */}
//             {isExpanded && (
//               <div className="p-4 sm:p-6">
                
//                 {/* Category Tabs */}
//                 <div className="mb-6">
//                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                     {categories.map((category) => (
//                       <Button
//                         key={category}
//                         variant={selectedCategory === category ? "default" : "outline"}
//                         onClick={() => setSelectedCategory(category)}
//                         className={`whitespace-nowrap rounded-full text-sm flex-shrink-0 transition-all duration-300 ${
//                           selectedCategory === category 
//                             ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
//                             : 'hover:bg-slate-100 dark:hover:bg-slate-800'
//                         }`}
//                       >
//                         {category}
//                       </Button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Experience Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                   {filteredExperiences.map((experience) => (
//                     <Card 
//                       key={experience.id}
//                       className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group ${
//                         selectedExperiences.includes(experience.id) 
//                           ? 'ring-2 ring-purple-500 shadow-md' 
//                           : 'hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-800'
//                       }`}
//                       onClick={() => toggleExperience(experience.id)}
//                     >
//                       <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
//                         <img 
//                           src={experience.image} 
//                           alt={experience.title}
//                           className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
//                         {/* Heart Button */}
//                         <div className="absolute top-2 right-2">
//                           <div
//                             className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
//                               selectedExperiences.includes(experience.id)
//                                 ? 'bg-purple-500 text-white'
//                                 : 'bg-white/90 text-slate-600'
//                             }`}
//                           >
//                             <Heart 
//                               className={`w-4 h-4 transition-all duration-300 ${
//                                 selectedExperiences.includes(experience.id) 
//                                   ? 'fill-white' 
//                                   : ''
//                               }`}
//                             />
//                           </div>
//                         </div>

//                         {/* Info Icon */}
//                         <div className="absolute bottom-2 right-2">
//                           <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center">
//                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">i</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="p-3">
//                         <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">
//                           {experience.title}
//                         </h3>
//                         <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
//                           {experience.description}
//                         </p>
                        
//                         <div className="flex items-center justify-between mt-2">
//                           <div className="flex items-center gap-1">
//                             <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                             <span className="text-xs text-slate-600 dark:text-slate-400">{experience.rating}</span>
//                           </div>
//                           <span className="text-xs text-slate-500 dark:text-slate-500">{experience.duration}</span>
//                         </div>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>

//                 {/* Continue Button */}
//                 <Button 
//                   onClick={handlePreferencesComplete}
//                   className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
//                 >
//                   Continue with {selectedExperiences.length} Selected Preferences
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Enhanced Chat Input */}
//         <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
//           <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
//             <div className="flex items-center gap-3 p-4">
//               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
//                 <span className="text-white text-sm font-semibold">A</span>
//               </div>
//               <div className="flex-1 flex items-center gap-3">
//                 <input 
//                   type="text" 
//                   placeholder="Ask Travion ..."
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                   className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
//                 />
//                 <div className="flex items-center gap-2">
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="w-8 h-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
//                   >
//                     <ChevronDown className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="icon"
//                     onClick={handleSendMessage}
//                     disabled={!inputValue.trim()}
//                     className="w-8 h-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <ArrowRight className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PreferencesChat;