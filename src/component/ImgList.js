import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import artifact from "../abi/nft.json";
import { ethers } from "ethers";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

 // metamaskを介してネットワークノードとの通信をするオブジェクトを作成する
 const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
 // アドレス、ABI, プロバイダを指定してコントラクトオブジェクトを作成
 // コントラクトの状態を変化させる(gas代が必要な）操作をするためには場合はSignerを与える必要がある
 const provider = new ethers.providers.JsonRpcProvider();
 const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
const handleClick = async(e) => {
  const to = await getAccount()
  console.log(to)
  const signer = provider.getSigner(e.from);
  const nftContract = contract.connect(signer);
  await nftContract.approve(to, e.tokenId)
  // 同じ名前の関数が存在するときはこんな感じで指定するらしい
  await nftContract['safeTransferFrom(address,address,uint256)'](e.from, to, e.tokenId)

  // ether送金
  let receiverAddress = e.from
  // 送付する Ether の量
  let amountInEther = '10'
  // トランザクションオブジェクトを作成
  let tx = {
      to: receiverAddress,
      // 単位 ether を、単位 wei に変換
      value: ethers.utils.parseEther(amountInEther)
  }
  // 送金Transactionの実行
  const signer02 = provider.getSigner(to);
  signer02.sendTransaction(tx)
    .then((txObj) => {
        console.log(txObj)
    })
}
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
  console.log("props")
  console.log(props.length)
  console.log("props")
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
          {props[0]?.map((item) => (
            <Grid item xs={2} sm={4} md={4}>
              <Item>
                <ImageList sx={{ width: 400, height: 400 }} cols={1} rowHeight={164} key={item.id}>
                  <ImageListItem key={item.id}>
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
                        値段: 10ETH <br />
                          <Button variant="contained" onClick={() => handleClick({from:item.owner, tokenId:item.tokenId})}>購入</Button>
                      </div>
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
