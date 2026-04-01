// /**
//  * useAuth composable
//  * Provides reactive session state and auth utilities throughout the app
//  */
// import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router'

// const session = ref(JSON.parse(sessionStorage.getItem('dw_session') || 'null'))

// // OLD ONE
// // export function useAuth() {
// //   const router = useRouter()

// //   const isLoggedIn = computed(() => !!session.value)
// //   const isGuest = computed(() => session.value?.isGuest === true)
// //   const role = computed(() => session.value?.role || null)
// //   const displayName = computed(() => session.value?.displayName || 'User')
// //   const unitCode = computed(() => session.value?.unitCode || null)

// //   // Role checks
// //   const isSuperAdmin = computed(() => role.value === 'Super Admin')
// //   const isAdmin = computed(() => role.value === 'Admin' || role.value === 'Super Admin')
// //   const isResident = computed(() => role.value === 'Resident')

// //   function setSession(newSession) {
// //     session.value = newSession
// //     sessionStorage.setItem('dw_session', JSON.stringify(newSession))
// //   }

// //   function logout() {
// //     session.value = null
// //     sessionStorage.removeItem('dw_session')
// //     router.push({ name: 'login' })
// //   }

// //   return {
// //     session,
// //     isLoggedIn,
// //     isGuest,
// //     role,
// //     displayName,
// //     unitCode,
// //     isSuperAdmin,
// //     isAdmin,
// //     isResident,
// //     setSession,
// //     logout,
// //   }
// // }

// // NEW ONE
// // Add unitId to your refs
// const unitId = ref(null)

// export function useAuth() {
//   const updateAuthState = async (currSession) => { // Made this async
//     session.value = currSession
//     user.value = currSession?.user ?? null
    
//     if (currSession?.user) {
//       const metadata = currSession.user.user_metadata
//       role.value = metadata.role || 'resident'
//       displayName.value = metadata.full_name || 'User'
//       unitCode.value = metadata.unit_code || ''
      
//       // NEW: Fetch the actual Unit ID if we have a unit code
//       if (unitCode.value) {
//         const { data } = await supabase
//           .from('units')
//           .select('id')
//           .eq('code', unitCode.value)
//           .single()
//         unitId.value = data?.id || null
//       }

//       isResident.value = role.value === 'resident'
//       isAdmin.value = role.value === 'admin' || role.value === 'super_admin'
//       isSuperAdmin.value = role.value === 'super_admin'
//     } else {
//       // ... (reset values as you had before)
//       unitId.value = null
//     }
//   }
  
//   // Return unitId along with other refs
//   return {
//     session,
//     user,
//     role,
//     displayName,
//     unitCode,
//     unitId,
//     isResident,
//     isAdmin,
//     isSuperAdmin,
//     signOut
//   }
// }

// // NEW ONE OLD
// /**
//  * useAuth composable
//  * Provides reactive session state and auth utilities throughout the app
//  */
// import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router'
// import { supabase } from '@/services/supabaseClient.js'

// // 1. STATE (Declared outside the function to act as a global "Store")
// const session = ref(JSON.parse(sessionStorage.getItem('dw_session') || 'null'))
// const user = ref(null) // This was the missing one!
// const role = ref(session.value?.role || null)
// const displayName = ref(session.value?.displayName || 'User')
// const unitCode = ref(session.value?.unitCode || null)
// const unitId = ref(null) 

// export function useAuth() {
//   const router = useRouter()

//   // 2. COMPUTED PROPERTIES
//   const isLoggedIn = computed(() => !!session.value)
//   const isGuest = computed(() => session.value?.isGuest === true)

//   // Role checks (supports both CamelCase and snake_case for safety)
//   const isSuperAdmin = computed(() => 
//     role.value === 'Super Admin' || role.value === 'super_admin'
//   )
//   const isAdmin = computed(() => 
//     role.value === 'Admin' || role.value === 'admin' || isSuperAdmin.value
//   )
//   const isResident = computed(() => 
//     role.value === 'Resident' || role.value === 'resident'
//   )

//   // 3. METHODS
//   function setSession(newSession) {
//     if (!newSession) {
//        logout()
//        return
//     }
    
//     session.value = newSession
//     role.value = newSession.role || null
//     displayName.value = newSession.displayName || 'User'
//     unitCode.value = newSession.unitCode || null
//     // Note: unitId logic will be handled when the Resident component mounts 
//     // or we can add a fetch here if needed later.
    
//     sessionStorage.setItem('dw_session', JSON.stringify(newSession))
//   }

//   function logout() {
//     session.value = null
//     user.value = null
//     role.value = null
//     displayName.value = 'User'
//     unitCode.value = null
//     unitId.value = null
//     sessionStorage.removeItem('dw_session')
    
//     // Check if router exists before pushing (prevents errors in non-component contexts)
//     if (router) router.push({ name: 'login' })
//   }

//   return {
//     session,
//     user,
//     role,
//     displayName,
//     unitCode,
//     unitId,
//     isLoggedIn,
//     isGuest,
//     isSuperAdmin,
//     isAdmin,
//     isResident,
//     setSession,
//     logout,
//   }
// }

// ALL NEW ONE OLD
// mport { ref, computed } from 'vue'
// // import { useRouter } from 'vue-router'
// import { supabase } from '@/services/supabaseClient.js' // Your singleton import


// const session = ref(JSON.parse(sessionStorage.getItem('dw_session') || 'null'))
// const user = ref(null)
// const role = ref(null)
// const displayName = ref('User')
// const unitCode = ref(null)
// const unitId = ref(null)

// export function useAuth() {
//   // const router = useRouter()

//   // Use the supabase instance here!
//   async function fetchUnitId(code) {
//     if (!code) return
//     const { data, error } = await supabase
//       .from('units')
//       .select('id')
//       .eq('code', code)
//       .single()
    
//     if (data) unitId.value = data.id
//   }

//   function setSession(newSession) {
//     if (!newSession) {
//       logout()
//       return
//     }
//     session.value = newSession
//     role.value = newSession.role
//     displayName.value = newSession.displayName
//     unitCode.value = newSession.unitCode
    
//     // Now we are "reading"/using supabase!
//     fetchUnitId(newSession.unitCode) 
    
//     sessionStorage.setItem('dw_session', JSON.stringify(newSession))
//   }

// function logout() {
//     session.value = null
//     user.value = null
//     role.value = null
//     displayName.value = 'User'
//     unitCode.value = null
//     unitId.value = null
//     sessionStorage.removeItem('dw_session')
    
//     // Check if router exists before pushing (prevents errors in non-component contexts)
//     // if (router) router.push({ name: 'login' })
//     if (router) window.location.href = '/login'
//   }  

// return {
//     session,
//     user,
//     role,
//     displayName,
//     unitCode,
//     unitId,
//     setSession,
//     logout
//   }
// }

// NEW ONE
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabaseClient.js' // Using our new central supabase file

// 1. Global State
const session = ref(JSON.parse(sessionStorage.getItem('dw_session') || 'null'))
const user = ref(null)
const role = ref(session.value?.role || null)
const displayName = ref(session.value?.displayName || 'User')
const unitCode = ref(session.value?.unitCode || null)
const unitId = ref(null)

export function useAuth() {
  
  // 2. Computed Properties (The missing pieces!)
  const isLoggedIn = computed(() => !!session.value)
  const isGuest = computed(() => session.value?.isGuest === true)
  const isSuperAdmin = computed(() => role.value === 'Super Admin' || role.value === 'super_admin')
  const isAdmin = computed(() => role.value === 'Admin' || role.value === 'admin' || isSuperAdmin.value)
  const isResident = computed(() => role.value === 'Resident' || role.value === 'resident')

  // 3. Methods
  async function fetchUnitId(code) {
    if (!code) return
    const { data, error } = await supabase
      .from('units')
      .select('id')
      .eq('code', code)
      .single()
    
    if (data) unitId.value = data.id
    if (error) console.warn("Supabase Fetch Error (Unit ID):", error.message)
  }

  function setSession(newSession) {
    if (!newSession) {
      logout()
      return
    }
    session.value = newSession
    role.value = newSession.role
    displayName.value = newSession.displayName
    unitCode.value = newSession.unitCode
    
    fetchUnitId(newSession.unitCode) 
    
    sessionStorage.setItem('dw_session', JSON.stringify(newSession))
  }

  function logout() {
    session.value = null
    user.value = null
    role.value = null
    displayName.value = 'User'
    unitCode.value = null
    unitId.value = null
    sessionStorage.removeItem('dw_session')
    window.location.href = '/' // Safe redirect to login
  }

  // 4. Return EVERYTHING (This fixes the router crash!)
  return {
    session, user, role, displayName, unitCode, unitId,
    isLoggedIn, isGuest, isSuperAdmin, isAdmin, isResident,
    setSession, logout
  }
}