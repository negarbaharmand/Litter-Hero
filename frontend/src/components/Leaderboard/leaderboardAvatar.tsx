import {useState } from 'react';

const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase(); //take the first letter in the username and turn it into uppercase
};

const getAvatarColor = (username: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500']; //all prossible colors 
    const hash = username.charCodeAt(0); // the first inital 
    return colors[hash % colors.length]; // gives a random color based on modulo 
}
 //function that creates the default avatar
function DefualtAvatar({ username }: { username: string }) {
    const initial = getInitial(username);
    const avatarColor = getAvatarColor(username);
    
    return (
        <div
            className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
        >
            {initial}    
        </div>
    )
}
 //functions for all profile pictures 
export default function ProfilePicture({username, profilePictureUrl}: {username: string; profilePictureUrl: string | null;}){
    const [imageError, setImageError] = useState(false);
    //if theres an error with the profile picture URL or if the user hasn't entered any they will be assigned one of the default profile pictures 
    if(!profilePictureUrl || imageError){
        return <DefualtAvatar username={username}></DefualtAvatar>
    }
    // and if not their profile picture will be the image URL that they user entered. 
    return (
        <img src={profilePictureUrl} alt={`${username}'s profile picture`}
        className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-600"
        onError={() => setImageError(true)}
        />
    )
} 