import { init, track, setUserId, identify } from '@amplitude/analytics-react-native';

// const amplitudeInstance = init('344af1d7eb077411624fb6078fb2321d');
const amplitudeInstance = init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY)


export const EVENTS = {
    LOGIN: 'Login Attempt',
    SIGNUP: 'Signup Attempt',
    VIEWHOME: 'Visit Home Page',
    VIEWPROFILE: 'Visit Profile Page', 
    VIEWCOMM: 'Visit Community Page', 
    LIST_BOOK: 'Book Listed',
    DELETE_BOOK: 'Book Deleted',
    BORROWBOOK: 'Borrow Button Click',
    EXCHANGEBOOK: 'Exchange Button Click',
    CHAT_SENT: 'Chat Message Sent',
    PROFILE_LISTING: 'Listed Book from Profile',
    POSTING: 'Created a Post',
  };

export const logEvent = (eventName, properties = {}) => {
    track(eventName, properties);
  };

export const setUser = (userId, userProperties = {}) => {
    setUserId(userId);
    identify(userProperties);
  };