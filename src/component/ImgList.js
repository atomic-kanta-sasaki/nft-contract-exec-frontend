import * as React from 'react';
import { useEffect, useState } from "react";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import artifact from "../abi/nft.json";
import { ethers } from "ethers";
import AppBar from './AppBar';
import Loading from './Loading';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

 // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
 const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
 const provider = new ethers.providers.AlchemyProvider(
   "goerli",
   process.env.REACT_APP_ALCHEMY_API_KEY
 );
  const userWallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
  const nftContract = new ethers.Contract(contractAddress, artifact.abi, userWallet);

const getAccount = async () => {
  try {
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (account.length > 0) {
          return account[0];
      } else {
          return "";
      }

  } catch (err) {
      if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
      } else {
          console.error(err);
      }
      return "";
  }
}

const StandardImageList = (props) => {
    const [ isLoading, setIsLoading ] = useState(false);
    console.log('props')
    console.log(props)
    const { data, title } = props
    const handleClick = async(e) => {
      try {
        setIsLoading(true)
        const to = await getAccount()
        console.log(e.from)
        console.log(to)
        console.log(e.tokenId)
        const hhhh = await nftContract.approve(to, e.tokenId)
        const sleep = (second) => new Promise(resolve => setTimeout(resolve, second * 15000))
        console.log('start')
        console.log(`${new Date().getSeconds()} 秒`)
        await sleep(1)
        console.log(`${new Date().getSeconds()} 秒`)
        console.log('end')
        // 同じ名前の関数が存在するときはこんな感じで指定するらしい
        await nftContract['safeTransferFrom(address,address,uint256)'](e.from, to, e.tokenId)
        console.log('start')
        console.log(`${new Date().getSeconds()} 秒`)
        await sleep(1)
        console.log(`${new Date().getSeconds()} 秒`)
        console.log('end')
        // ether送金
        let receiverAddress = e.from
        // 送付する Ether の量
        let amountInEther = '0.001'
        // トランザクションオブジェクトを作成
        let tx = {
            from: to,
            to: receiverAddress,
            // 単位 ether を、単位 wei に変換
            value: ethers.utils.parseEther(amountInEther)
        }
        setIsLoading(false)
        setMessage("購入完了しました。")
        setOpen(true);
        // 送金Transactionの実行
        provider.sendTransaction(tx)
          .then((txObj) => {
              console.log(txObj)
          })
      } catch(e) {
        setMessage("購入に失敗しました。")
        setOpen(true);
        setIsLoading(false)
      }
    }

    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    };

    const action = (
      <React.Fragment>
        <Button color="secondary" size="small" onClick={handleClose}>
        </Button>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    );
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          <AppBar title={title} />
          <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            message={message}
            action={action}
          />

          {data?.map((item) => (
            <Grid item xs={2} sm={4} md={4} key={item.id}>
              <Item>
                <ImageList sx={{ width: 400, height: 400 }} cols={1} rowHeight={164} key={item.id}>
                  <ImageListItem key={item.id}>
                    {
                      isLoading ?
                      <Loading /> :
                      <div>
                        <div>
                          <img
                            src={`${item.imageUri}?w=164&h=164&fit=crop&auto=format`}
                            srcSet={`${item.imageUri}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            alt={item.title}
                            style={{height: '200px', width: '200px'}}
                            loading="lazy"
                          />
                        </div>
                        <div>
                          所有者:<br /> {item.owner} <br />
                          値段: 0.001GoeriETH <br />
                          <Button variant="contained" onClick={() => handleClick({from:item.owner, tokenId:item.tokenId})}>購入</Button>
                        </div>
                      </div>
                    }
                  </ImageListItem>
                </ImageList>
              </Item>
            </Grid>
          ))}

        </Grid>
      </Box>
    );
}

export default StandardImageList;
