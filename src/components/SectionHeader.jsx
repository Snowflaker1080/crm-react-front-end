const SectionHeader = ({ title, right }) => {
  return (
    <header className="flex-between" style={{ marginBottom: '.6rem' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div>{right}</div>
    </header>
  );
};

export default SectionHeader;