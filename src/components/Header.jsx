export const Profile = () => (
    <div className="profile float-end">
        <i className="bi bi-person-circle"></i>
        <em className="ms-2 fst-normal">Frodo Baggins</em>
    </div>
);

export const Header = () => (
    <div className="header container-fluid mb-4">
        <div className="row align-items-center">
            <div className="col">
                <h2 className="my-2">Employee Manager 9000</h2>
            </div>

            <div className="col">
                <Profile />
            </div>
        </div>
    </div>
);

export default Header;
