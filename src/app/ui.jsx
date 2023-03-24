import React, { useEffect } from 'react';
import styles from './ui.module.scss';
import Button from './components/Button';
import { useState } from 'react';
import axios from 'axios';

const UI = ({}) => {
  const [auth, setAuth] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [selectedTag, setSelectedTag] = useState();
  const [accessToken, setAccessToken] = useState();
  // const [refreshToken, setRefreshToken] = useState();
  const [fetchSuccess,setFetchSuccess] = useState(true);
  const [content, setContent] = useState();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);
  const [replaceImageURL, setReplaceImageURL] = useState();
  const tags = [
    'Make Shorter',
    'Longer',
    'Funnier',
    'Simpler',
    'Casual',
    'Formal',
    'Tagline',
    'Improve',
    'Fix Spelling',
    'Riskier',
    'To Bullet Points',
    'To Tagline',
    'To Emojis',
  ];

  const chooseTag = (selectedTag) => {
    setSelectedTag(selectedTag);
  };

  function fetchImageComponent() {
    if (auth) {
      parent.postMessage({ pluginMessage: { type: 'clone' } }, '*');
    }
  }

  const fetchImageComponentTimer = setInterval(fetchImageComponent, 2000);

  const [tab, setTab] = useState(true); //true stands for editing tab

  const tabChange = () => {
    setTab(!tab);
  };

  const googleLogin = () => {
    parent.postMessage({ pluginMessage: { type: 'login' } }, '*');
    setLoading(true)
  };

  const openProfile = () => {};

  const logout = () => {
    setLoading(false);

    const url = 'https://api.bud.dev2staging.com/v1/users/logout';
    const requestBody = { "source": "device" };
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    axios
      .post(url, requestBody, config)
      .then((response) => {
        console.log(response.data);
        parent.postMessage({ pluginMessage: { type: 'LogOut' } }, '*');
        setAuth(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const Tags = ({ tag, chooseTag }) => {
    const [isTagged, setIsTagged] = useState(false);

    const tagged = () => {
      if (!isTagged) {
        chooseTag(tag);
      } else {
        chooseTag('');
      }
      setIsTagged(!isTagged);
    };

    return (
      <div onClick={tagged} className={styles.tags}>
        <h3>{tag}</h3>
      </div>
    );
  };

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: 'Get_Access' } }, '*');
    // parent.postMessage({ pluginMessage: { type: 'Get_Refresh' } }, '*');
    parent.postMessage({ pluginMessage: { type: 'Get_userData' } }, '*');
    window.onmessage = (event) => {
      let data = event.data.pluginMessage?.user_data;
      if (data) {
        setUserData(data);
      }
      let clear_Access = event.data.pluginMessage?.clear_Access;
      // let clear_Refresh = event.data.pluginMessage?.clear_Refresh;
      if (clear_Access === true /*&& clear_Refresh === true */) {
        setAuth(false);
        setAccessToken();
        // setRefreshToken();
      }
      let process = event.data.pluginMessage?.process;
      let Access = event.data.pluginMessage?.Get_Access;
      let Accesstoken = event.data.pluginMessage?.accesstoken;
      // let Refresh = event.data.pluginMessage?.Get_Refresh;
      // let Refreshtoken = event.data.pluginMessage?.refreshtoken;
      // if (Refresh === true) {
      //   setRefreshToken(Refreshtoken);
      //   console.log("Refresh Token is", Refreshtoken)
      // }
      if (Access === true) {
        setAuth(true);
        setAccessToken(Accesstoken);
        console.log("Access Token is", Accesstoken);
      } else if (process == 'LoginProcess') {
        let windowURL = event.data.pluginMessage?.windowURL;
        let pollURL = event.data.pluginMessage?.pollURL;
        window.open(windowURL);

        var startTime = new Date().getTime();

        var interval = setInterval(function(){
          if(new Date().getTime() - startTime > 900000){
            if(!acTK) {
              clearInterval(interval);
              clearInterval(fetchAccessTokenTimer); 
              setFetchSuccess(false);
          }}
          
      }, 2000);
        

        let acTK = null;
       // let rfTK = null;

        async function fetchAccessToken() {
          if (!acTK) {
            if (pollURL) {
              const res = await fetch(pollURL);
              const data = await res.json();
              acTK = data.data.accessToken;
             // rfTK = data.data.refreshToken;
            }
          } else {
            clearInterval(fetchAccessTokenTimer);
            window.parent.postMessage(
              { pluginMessage: { type: 'accessToken', accesstoken: acTK, /*refreshtoken: rfTK*/  } },
              '*'
            );
            setAuth(true);
            console.log(acTK);
            setAccessToken(acTK);
            // setRefreshToken(rfTK);

            const url = 'https://api.bud.dev2staging.com/v1/users/me';

            axios
              .get(url, {
                headers: {
                  Authorization: `Bearer ${acTK}`,
                },
              })
              .then((response) => {
                setUserData(response.data.data);
                window.parent.postMessage({ pluginMessage: { type: 'User_Data', data: response.data.data } }, '*');
                console.log(response.data.data);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }

        const fetchAccessTokenTimer = setInterval(fetchAccessToken, 1000);
      }

      if (process == 'ImageProcess') {
        let imgData = event.data.pluginMessage?.bytesData;

        //Converting img bytes to url for displaying
        const uint8ToBase64 = (imgData) =>
          btoa(
            Array(imgData.length)
              .fill('')
              .map((_, i) => String.fromCharCode(imgData[i]))
              .join('')
          );

        let uint8data = uint8ToBase64(imgData);
        const finalEncodedData = `data:image/*;base64,${uint8data}`;
        setImageURL(finalEncodedData);
      }
    };
  }, []);


  return (
    <div className={styles.Container}>
    { !auth ? ( fetchSuccess ?
        // LOGIN PAGE
        (<div className={styles.loginContainer}>
          <h4 className={styles.Title}>Let's Explore!</h4>
          <h2 className={styles.BottomText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          </h2>
          <img
            className={styles.logo}
            src="https://ksdqdmtvyelwbucrzien.supabase.co/storage/v1/object/public/budimages/StandingLogo.png?t=2023-03-13T08%3A35%3A24.793Z"
          />

          <div className={styles.buttonContainer}>
            { loading? <div className={styles.loaderButton}><img src="https://ksdqdmtvyelwbucrzien.supabase.co/storage/v1/object/public/budimages/loading.gif?t=2023-03-15T05%3A05%3A06.355Z"/></div>: <Button onClick={googleLogin}>Login with BudStudio</Button> }
          </div>
          <h2 className={styles.BottomText}>
            *Consectetur adipiscing elit sed do eiusmod lorem ipsum dolor sit amet c. sit amet, consectetur *
          </h2>
        </div>) : (<div className={styles.loginContainer}>
          <h4 className={styles.Title}>Oops!</h4>
          <h2 className={styles.BottomText}>
            There was a problem while authenticating you, please contact the Bud authorities...
          </h2>
          <img
            className={styles.logo}
            src="https://ksdqdmtvyelwbucrzien.supabase.co/storage/v1/object/public/budimages/StandingLogo.png?t=2023-03-13T08%3A35%3A24.793Z"
          />
          <h2 className={styles.BottomText}>
            ...or try again later!!
          </h2>
        </div>)
      ) : (
        // BUD PAGE
        <div className={styles.devbudContainer}>
          {tab ? ( // CONTENT TAB
            <div className={styles.devbudContainer}>
              <div className={styles.Header}>
                <img
                  className={styles.bulb}
                  src="https://ksdqdmtvyelwbucrzien.supabase.co/storage/v1/object/public/budimages/bulbnotification.png?t=2023-03-13T10%3A32%3A21.164Z"
                />
                <h2 className={styles.devbudTitle}>Welcome to Bud!</h2>

                <div className={styles.dropdown}>
                  <img className={styles.profileImage} src={userData?.avatar} />

                  <div className={styles.dropdownContent}>
                    <div className={styles.userName}>{userData?.name}</div>
                    <div onClick={openProfile}>My Profile</div>
                    <div onClick={logout}>Logout</div>
                  </div>
                </div>
              </div>

              <div className={styles.tabsAndLogout}>
                <div className={styles.tabs}>
                  <p onClick={tabChange} className={`${tab ? styles.tabActive : styles.tab}`}>
                    Content
                  </p>
                  <p onClick={tabChange} className={`${!tab ? styles.tabActive : styles.tab}`}>
                    Image
                  </p>
                </div>
              </div>

              <h1 className={styles.contentText}>Type something here! 👇</h1>

              <div className={styles.contentTextAreaDiv}>
                <textarea
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your content here..."
                  value={content}
                  className={styles.textarea}
                ></textarea>
              </div>

              <div className={styles.DevbudTags}>
                {tags.map((tag, key) => (
                  <Tags tag={tag} key={key} chooseTag={chooseTag} />
                ))}
              </div>

              <div className={styles.custom}>
                <div className={styles.line}></div>
                <h1 className={styles.customText}>or type in a custom prompt</h1>
                <div className={styles.line}></div>
              </div>

              <div className={styles.textareaDiv}>
                <textarea
                  onChange={(e) => setSelectedTag(e.target.value)}
                  placeholder="Write in Yoda style"
                  value={selectedTag}
                  className={styles.textarea}
                ></textarea>
              </div>

              <div className={styles.devbudButton}>Let's Go!</div>
            </div>
          ) : (
            // IMAGE TAB
            <div className={styles.devbudContainer}>
              <div className={styles.Header}>
                <img
                  className={styles.bulb}
                  src="https://ksdqdmtvyelwbucrzien.supabase.co/storage/v1/object/public/budimages/bulbnotification.png?t=2023-03-13T10%3A32%3A21.164Z"
                />
                <h2 className={styles.devbudTitle}>Welcome to Bud!</h2>

                <div className={styles.dropdown}>
                  <img className={styles.profileImage} src={userData?.avatar} />

                  <div className={styles.dropdownContent}>
                    <div className={styles.userName}>{userData?.name}</div>
                    <div onClick={openProfile}>My Profile</div>
                    <div onClick={logout}>Logout</div>
                  </div>
                </div>
              </div>

              <div className={styles.tabsAndLogout}>
                <div className={styles.tabs}>
                  <p onClick={tabChange} className={`${tab ? styles.tabActive : styles.tab}`}>
                    Content
                  </p>
                  <p onClick={tabChange} className={`${!tab ? styles.tabActive : styles.tab}`}>
                    Image
                  </p>
                </div>
              </div>

              <h1 className={styles.contentText}> Replace the component with another image 👇 </h1>

              <div className={styles.textareaDivWriting}>
                <textarea
                  value={replaceImageURL}
                  onChange={(e) => setReplaceImageURL(e.target.value)}
                  placeholder="Paste the URL of the image..."
                  className={styles.textareaWriting}
                ></textarea>
              </div>

              <h1 className={styles.contentText}> Selected Component </h1>

              {imageURL ? (
                <img className={styles.componentImage} src={imageURL} alt="Selected Component" />
              ) : (
                <h3>Select a component!</h3>
              )}

              <div className={styles.devbudButton}>Generate Image!</div>

              <h1 className={styles.contentText}> Preview Generated Image 👇 </h1>

              {!imageURL ? <></> : <></>}

              <div className={styles.devbudButton}>Replace Image!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UI;
