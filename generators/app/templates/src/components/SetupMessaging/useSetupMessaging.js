<% if (!includeRedux) { %>import { useMessaging, useUser, useFirestore } from 'reactfire'
<% } %><% if (includeRedux) { %>import firebase from 'firebase/app'
import 'firebase/messaging'<% } %>
import { publicVapidKey } from '../../config'
import { useNotifications } from 'modules/notification'
import { USERS_COLLECTION } from 'constants/firebasePaths'

let messagingInitialized = false

/**
 * Hook for setting up FCM including setting of
 * messaging token to the user object within Firestore.
 */
export default function useSetupMessaging() {<% if (!includeRedux) { %>
  const messaging = useMessaging()
  const firestore = useFirestore()
  const { FieldValue } = useFirestore
  const user = useUser()<% } %><% if (includeRedux) { %>
  const messaging = firebase.messaging()
  const firestore = firebase.firestore()
  const { FieldValue } = firebase.firestore
  const user = firebase.auth().currentUser<% } %>
  const { showSuccess } = useNotifications()

  /**
   * Write FCM messagingToken to user profile
   * @param {String} messagingToken - Token to be written to user profile
   */
  function updateUserProfileWithToken(messagingToken) {
    return firestore
      .doc(`${USERS_COLLECTION}/${user.uid}`)
      .set(
        {
          messaging: {
            mostRecentToken: messagingToken,
            updatedAt: FieldValue.serverTimestamp()
          }
        },
        { merge: true }
      )
      .catch((err) => {
        /* eslint-disable no-console */
        console.error(
          'Error updating user profile with messaging token:',
          err.message
        )
        /* eslint-enable no-console */
        return Promise.reject(err)
      })
  }

  /**
   * Get Cloud Messaging Token from Firebase messaging
   * and write it to the currently logged in user's profile
   */
  function getTokenAndWriteToProfile() {
    return messaging
      .getToken()
      .then(updateUserProfileWithToken)
      .catch((err) => {
        console.error('Unable to get token and write to profile', err) // eslint-disable-line no-console
        return Promise.reject(err)
      })
  }

  /**
   * Initialize Firebase Cloud Messaging including requesting
   * Notification permission, setting Public Vapid Key, attaching token
   * refresh listener, and attaching onMessage listener. Internally handles
   * being initialized only once.
   */
  function initializeMessaging() {
    // Exit if public vapid key is not set
    if (!publicVapidKey) {
      /* eslint-disable no-console */
      console.warn(
        'Skipping messaging initialization, publicVapidKey not set in src/config.js'
      )
      /* eslint-enable no-console */
      return
    }
    if (messagingInitialized) {
      return
    }

    messaging.usePublicVapidKey(publicVapidKey)

    // Handle Instance ID token updates
    messaging.onTokenRefresh(() => {
      getTokenAndWriteToProfile()
    })
    messagingInitialized = true
    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage((payload) => {
      console.log('Message', payload) // eslint-disable-line no-console
      showSuccess(payload.notification.body)
    })

    // Request permission to setup browser notifications
    messaging
      .requestPermission()
      .then(() => getTokenAndWriteToProfile(messaging))
      .catch((err) => {
        console.error('Unable to get permission to notify: ', err) // eslint-disable-line no-console
        return Promise.reject(err)
      })
  }
  return { initializeMessaging }
}
