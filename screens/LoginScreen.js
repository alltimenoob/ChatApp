import React, { useEffect,useState } from 'react'
import { StyleSheet,Text,View,KeyboardAvoidingView, TextInput, TouchableOpacity ,Alert } from 'react-native'
import { auth , db} from '../firebase'
import {createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth"
import { useNavigation } from '@react-navigation/native'
import { doc,setDoc} from 'firebase/firestore'


const LoginScreen = () => {
    const [email , setEmail ] = useState('')
    const [password , setPassword ] = useState('')
    const [name, setName] = useState('')
    const [showName, setshowName] = useState(false)
    const [state ,setState ] = useState(false)
    const navigation = useNavigation()

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(user => {
            if(user){
                navigation.replace("Home")
                setState(false)
            }
            else
            {
                setState(true)
            }
        })

        return unsub
    },[])

    const headleSignUp = () => {
        if((name) == '')
        {
            setshowName(true)
        }
        else
        {
            createUserWithEmailAndPassword(auth,email,password)
            .then(() => {
                setDoc(doc(db,'users',Math.random().toString(36).substring(7)),{email:email.toLocaleLowerCase(),name:name})
            })
            .catch((error)=>{
                let err ;
                switch(error.code)
                {
                    case 'auth/email-already-in-use':
                        err = "Email is already in use"
                        break;
                    case 'auth/invalid-email':
                        err = "Email is not valid"
                        break;
                    case 'auth/internal-error':
                        err = "Email & Password are not valid"
                        break;
                    case 'auth/weak-password':
                        err = "Given Password is weak, Try Again!"
                        break;
                    default:
                        err = "Email & Password are not valid"
                        break;
                }
                Alert.alert("Something Went Wrong!",err)
            })
        }
        
    }

    const handleLogin = () => {
        signInWithEmailAndPassword(auth,email,password)
        .then(userCredentials => {
            
        })
        .catch(error=>alert(error))
    }

    if(state)
    {
        return(
            <KeyboardAvoidingView
            style={styles.container}
            behavior="padding">
                <View style={styles.inputContainer}>
                    <Text style={{marginBottom:'10%',fontSize:20,color:'#FF5500',fontWeight:'700'}}>Made By Mihir 💖</Text>
                    {showName && <TextInput
                    value={name}
                    onChangeText={text=>setName(text)}
                    placeholder='Name'
                    style={styles.input}>
                    </TextInput>}

                    <TextInput
                    value={email}
                    onChangeText={text=>setEmail(text)}
                    placeholder='Email'
                    style={styles.input}>
                    
                    </TextInput>
                    <TextInput
                    value={password}
                    onChangeText={text=>setPassword(text)}
                    placeholder='Password'
                    style={styles.input}
                    secureTextEntry>
                    </TextInput>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleLogin}
                    style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={headleSignUp}
                    style={[styles.button, styles.buttonOutline]}>
                        <Text style={styles.buttonOutLineText}>Register</Text>
                    </TouchableOpacity>
                </View>
                
            </KeyboardAvoidingView>
        )
    }
    else
    {
        return(<View></View>)
    }
}

export default LoginScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:"#fff"
    },

    inputContainer:{
        width:'80%',
       
    },

    input:{
        padding:15,
        borderRadius:10,
        marginTop:5,
        borderRadius:10,
        borderWidth:2,
        borderColor:"#FF5500",
        backgroundColor:'white',
    },
                        
    buttonContainer:{
        width:'80%',
        justifyContent:'center',
        alignItems:'center',
        marginTop:40,
    },

    button:{    
        backgroundColor:'#FF5500',
        width:'100%',
        padding: 15,
        borderRadius:10,
    },

    buttonText:{
        color:'white',
        fontWeight:'700',
        fontSize:16
    },

    buttonOutline:{
        backgroundColor:'white',
        marginTop:5,
        borderColor:'#FF5500',
        borderWidth:2
    },

    buttonOutLineText:{
        color:'#FF5500',
        fontWeight:'700',
        fontSize:16
    }

    
})