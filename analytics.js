import { init, track, setUserId, Identify, identify } from '@amplitude/analytics-react-native';
import {auth, FIRESTORE_DB} from './firebaseConfig'
import { doc, getDoc } from "firebase/firestore";


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

const getProfileDocument = async () => {
  try {
    user = auth.currentUser
    console.log("Getting user document", user)
    const docRef = doc(FIRESTORE_DB, "profile", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such document!");
      return {};
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    setFetchError(true);
    return {};
  }
};

const getUserType = async () => {
  try {
    const profileData = await getProfileDocument();
    if (profileData && profileData.userType) {
      console.log("User type retrieved:", profileData.userType);
      return profileData.userType
    }
    return 'casual'
  } catch (error) {
    console.error("Error fetching user type:", error);
    return 'casual'
  }
};


export const logEvent = async (eventName, properties = {}) => {
  userType = await getUserType()
  console.log("got usertype", {...properties, userType})
  track(eventName, {...properties, userType});
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