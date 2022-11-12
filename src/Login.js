import { Link } from "react-router-dom";

const Login = () => {
  return (
    <>
      <h1>ログインページ</h1>
      <div>
        新規登録は<Link to={`/register/`}>こちら</Link>
      </div>
      <div>
        <Link to={`/`}>ホームに戻る</Link>
      </div>
    </>
  );
};

export default Login;