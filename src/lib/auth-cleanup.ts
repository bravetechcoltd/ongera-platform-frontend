import Cookies from 'js-cookie';


export function clearAuthData() {
  Cookies.remove('token');
  Cookies.remove('user');
  
  try {
    localStorage.removeItem('persist:root');
    localStorage.removeItem('bwenge_plus_enabled');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
  
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error);
  }
  
  console.log('✅ All auth data cleared');
}

/**
 */
export function hasValidAuth(): boolean {
  const token = Cookies.get('token');
  const userCookie = Cookies.get('user');
  
  if (!token || !userCookie) {
    return false;
  }
  
  try {
    const user = JSON.parse(userCookie);
    return !!user && !!user.id;
  } catch {
    return false;
  }
}