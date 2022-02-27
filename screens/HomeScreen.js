// @refresh reset
import { useNavigation, useScrollToTop } from '@react-navigation/native'
import React, { useEffect , useState , useCallback} from 'react'
import { StyleSheet,Text,TouchableOpacity,unstable_batchedUpdates,View } from 'react-native'
import { auth ,db} from '../firebase'
import { collection,doc,onSnapshot,setDoc} from 'firebase/firestore'
import { GiftedChat } from 'react-native-gifted-chat'

const chatRef = collection(db,'chats')


const HomeScreen = () =>{
    const [user ,setUser ] = useState()
    const navigation = useNavigation()
    const [messages , setMessages ] = useState([])

    useEffect(()=>{
        setUser({ _id : Math.random().toString(36).substring(7) , name : auth.currentUser?.email})
        const unsub = onSnapshot(chatRef,(snapshot)=>{
            const messages = snapshot.docChanges().filter(({type})=> type==='added')
            .map(({doc}) => {
                const message = doc.data()
                return {...message, 'createdAt': message.createdAt.toDate()}
            })
            .sort((a,b)=>b.createdAt.getTime() - a.createdAt.getTime())
            appendMessages(messages)
            console.log(user)
        })
        return () => unsub()
    },[]);

    const appendMessages = useCallback((messages) => {
        setMessages((previous) => GiftedChat.append(previous , messages) )
    },[messages])

    async function handleSend(messages) {
        const writes = messages.map(m=>{ setDoc(doc(db, "chats", Math.random(100).toString()),m) } )
        console.log(writes)
        await Promise.all(writes)
    }

    const handleSignOut = () => {
        auth.signOut()
        .then(()=>{
            navigation.replace("Login")
        })
        .catch(error => alert(error.message))
    }


    return(
        <View style={styles.container} behavior="padding">
            <GiftedChat messages={messages} user={user} onSend={handleSend} />
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        
    },
    button:{
        marginTop:20,
        width:'60%',
        padding:15,
        backgroundColor:"#FF5500",
        borderRadius:10,
        alignItems:'center'
    },
    buttonText:{
        color:'white',
        fontWeight:"700",
        fontSize:16,
    },



})