import React, { useEffect,useState } from 'react'
import { StyleSheet,Text,View,KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native'
import { auth } from '../firebase'
import {createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth"
import { useNavigation } from '@react-navigation/native'
import { backgroundColor } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes'


const LoginScreen = () => {
    const [email , setEmail ] = useState('')
    const [password , setPassword ] = useState('')

    const navigation = useNavigation()

    const [state ,setState ] = useState(false)
    
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
        createUserWithEmailAndPassword(auth,email,password)
        .then(userCredentials => {
            const user = userCredentials.user;
        })
        .catch(error => alert("Enter Correct Email & Password"))
    }

    const handleLogin = () => {
        signInWithEmailAndPassword(auth,email,password)
        .then(userCredentials => {
            const user = userCredentials.user
            console.log("Logged In With "+user.email)
        })
        .catch(error=>(console.log("Enter Correct Email & Password")))
    }
    if(state)
    {
        return(
            <KeyboardAvoidingView
            style={styles.container}
            behavior="padding">
                <View style={styles.inputContainer}>
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