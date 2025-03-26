import { init, track, setUserId, Identify,identify } from '@amplitude/analytics-react-native';

init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY)

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
    POSTENGAGE: 'Engaged with a post',
    LIBBOOK: 'Added book to library',
    REPORT: 'Reported a Listing',
    VERIFICATION: 'Checked Verification',
    USERTYPE: 'Added User Type'
  };

export const logEvent = (eventName, properties = {}) => {
    track(eventName, properties);
  };

export const setUser = (userId, userProperties = {}) => {

    if (!userId && userProperties.email) {
    userId = userProperties.email; 
    }
    setUserId(userId);

    const identifyObj = new Identify();

    Object.keys(userProperties).forEach((key) => {
      identifyObj.set(key, userProperties[key])
    })
    identify(identifyObj);
  };