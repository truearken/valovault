type HeaderProps = {
  isEditing: boolean;
};

export default function Header({ isEditing }: HeaderProps) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <span className="navbar-brand">ValoVault</span>
        <div className="ms-auto">
          {!isEditing && (
            <></>
          )}
        </div>
      </div>
    </nav>
  );
}
